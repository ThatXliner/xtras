#!/usr/bin/env node
// Build a critique pack for a video or audio file, so critics can judge what they can't play.
//
//   node pack.mjs <media> [--ref <media>]... [--out <dir>] [--ignore-band 0.6,0.75]
//
// For each file it writes, under <out>/<name>/:
//   strips/tNNN.jpg   5 fps frame strips, 6 s each (10×3 tiles), so motion is visible
//   contact.jpg       one frame every 2 s, for composition and variety at a glance
//   spectrum.png      the audio as a picture: density, gaps, a music bed that never changes
// and prints the numbers critics compare against the references:
//   frozen / near-still share of frames, loudness (integrated, range, true peak),
//   and the loudest and quietest 5 s windows.
//
// --ignore-band skips a horizontal band (fractions of the height) when measuring motion,
// e.g. burned-in captions that change every word and hide frozen art.
// Requires ffmpeg and ffprobe on PATH.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const STRIP_SECONDS = 6;
const CONTACT_INTERVAL_SECONDS = 2;
const LOUDNESS_WINDOW_SECONDS = 5;
const MOTION_WIDTH = 72;
const MOTION_HEIGHT = 128;
const FROZEN_MEAN_CHANGE = 0.6;
const NEAR_STILL_MEAN_CHANGE = 1.5;

function parseArgs(argv) {
    const options = { media: null, refs: [], outDir: "critique-pack", ignoreBand: null };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--ref") options.refs.push(argv[++i]);
        else if (arg === "--out") options.outDir = argv[++i];
        else if (arg === "--ignore-band") options.ignoreBand = argv[++i].split(",").map(Number);
        else options.media = arg;
    }
    if (!options.media || !existsSync(options.media)) {
        console.error("usage: node pack.mjs <media> [--ref <media>]... [--out <dir>] [--ignore-band 0.6,0.75]");
        process.exit(1);
    }
    return options;
}

function probe(file) {
    const json = JSON.parse(
        execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", file]).toString(),
    );
    const streamTypes = new Set(json.streams.map((stream) => stream.codec_type));
    return { durationSeconds: Number(json.format.duration), hasVideo: streamTypes.has("video"), hasAudio: streamTypes.has("audio") };
}

function ffmpeg(args) {
    execFileSync("ffmpeg", ["-v", "error", "-y", ...args]);
}

// Rebuild only when the image is older than the media, so a re-render is never judged on stale frames.
function isFresh(output, media) {
    return existsSync(output) && statSync(output).mtimeMs >= statSync(media).mtimeMs;
}

function buildStrips(file, dir, durationSeconds) {
    mkdirSync(dir, { recursive: true });
    for (let startSeconds = 0; startSeconds < durationSeconds; startSeconds += STRIP_SECONDS) {
        const output = join(dir, `t${String(startSeconds).padStart(3, "0")}.jpg`);
        if (isFresh(output, file)) continue;
        ffmpeg(["-ss", String(startSeconds), "-t", String(STRIP_SECONDS), "-i", file,
            "-vf", "fps=5,scale=150:-1,tile=10x3", "-frames:v", "1", output]);
    }
}

function buildContactSheet(file, output, durationSeconds) {
    if (isFresh(output, file)) return;
    const frameCount = Math.max(1, Math.ceil(durationSeconds / CONTACT_INTERVAL_SECONDS));
    const columns = Math.min(8, frameCount);
    const rows = Math.ceil(frameCount / columns);
    ffmpeg(["-i", file, "-vf", `fps=1/${CONTACT_INTERVAL_SECONDS},scale=240:-1,tile=${columns}x${rows}`, "-frames:v", "1", output]);
}

function buildSpectrum(file, output) {
    if (isFresh(output, file)) return;
    ffmpeg(["-i", file, "-lavfi", "showspectrumpic=s=1200x400:legend=1", output]);
}

/** Share of consecutive frame pairs (15 fps, small grayscale) that barely change. */
function measureMotion(file, ignoreBand) {
    const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file,
        "-vf", `fps=15,scale=${MOTION_WIDTH}:${MOTION_HEIGHT},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 29 });
    const framePixels = MOTION_WIDTH * MOTION_HEIGHT;
    const frameCount = Math.floor(raw.length / framePixels);
    const [bandTop, bandBottom] = ignoreBand
        ? ignoreBand.map((fraction) => Math.floor(fraction * MOTION_HEIGHT))
        : [MOTION_HEIGHT, MOTION_HEIGHT];
    const meanChanges = [];
    for (let frame = 0; frame + 1 < frameCount; frame++) {
        let changeSum = 0;
        let pixelCount = 0;
        for (let y = 0; y < MOTION_HEIGHT; y++) {
            if (y >= bandTop && y < bandBottom) continue;
            for (let x = 0; x < MOTION_WIDTH; x++) {
                const index = y * MOTION_WIDTH + x;
                changeSum += Math.abs(raw[frame * framePixels + index] - raw[(frame + 1) * framePixels + index]);
                pixelCount++;
            }
        }
        meanChanges.push(changeSum / pixelCount);
    }
    if (meanChanges.length === 0) return null;
    const share = (limit) => meanChanges.filter((change) => change < limit).length / meanChanges.length;
    return { frozenFraction: share(FROZEN_MEAN_CHANGE), nearStillFraction: share(NEAR_STILL_MEAN_CHANGE) };
}

function measureLoudness(file) {
    const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"],
        { encoding: "utf8", maxBuffer: 1 << 28 });
    const summary = stderr.slice(stderr.lastIndexOf("Summary:"));
    const number = (pattern) => Number(summary.match(pattern)?.[1]);
    const windows = new Map();
    for (const match of stderr.matchAll(/t:\s*([\d.]+)\s+TARGET:.*?S:\s*(-?[\d.]+)/g)) {
        const windowStart = Math.floor(Number(match[1]) / LOUDNESS_WINDOW_SECONDS) * LOUDNESS_WINDOW_SECONDS;
        windows.set(windowStart, Math.max(windows.get(windowStart) ?? -Infinity, Number(match[2])));
    }
    const audible = [...windows].filter(([, lufs]) => lufs > -70).sort((a, b) => b[1] - a[1]);
    return {
        integratedLufs: number(/I:\s*(-?[\d.]+) LUFS/),
        loudnessRangeLu: number(/LRA:\s*(-?[\d.]+) LU/),
        truePeakDbfs: number(/Peak:\s*(-?[\d.]+) dBFS/),
        loudestWindows: audible.slice(0, 3),
        quietestWindows: audible.slice(-3).reverse(),
    };
}

function formatWindows(windows) {
    return windows.map(([start, lufs]) => `${start}–${start + LOUDNESS_WINDOW_SECONDS}s ${lufs.toFixed(1)}`).join(", ");
}

function packOne(file, outDir, ignoreBand, role) {
    const { durationSeconds, hasVideo, hasAudio } = probe(file);
    const dir = join(outDir, basename(file, extname(file)));
    mkdirSync(dir, { recursive: true });
    console.log(`\n${role}: ${resolve(file)}  (${durationSeconds.toFixed(1)} s)`);
    if (hasVideo) {
        buildStrips(file, join(dir, "strips"), durationSeconds);
        buildContactSheet(file, join(dir, "contact.jpg"), durationSeconds);
        console.log(`  strips:   ${resolve(dir, "strips")}/t*.jpg  (5 fps, ${STRIP_SECONDS} s each)`);
        console.log(`  contact:  ${resolve(dir, "contact.jpg")}  (one frame every ${CONTACT_INTERVAL_SECONDS} s)`);
        const motion = measureMotion(file, ignoreBand);
        if (motion) {
            console.log(`  motion:   frozen ${(motion.frozenFraction * 100).toFixed(0)}%, near-still ${(motion.nearStillFraction * 100).toFixed(0)}%`);
        }
    }
    if (hasAudio) {
        buildSpectrum(file, join(dir, "spectrum.png"));
        const loudness = measureLoudness(file);
        console.log(`  spectrum: ${resolve(dir, "spectrum.png")}`);
        console.log(`  loudness: ${loudness.integratedLufs} LUFS integrated, range ${loudness.loudnessRangeLu} LU, true peak ${loudness.truePeakDbfs} dBFS`);
        console.log(`            loudest ${formatWindows(loudness.loudestWindows)}`);
        console.log(`            quietest ${formatWindows(loudness.quietestWindows)}`);
    }
}

const options = parseArgs(process.argv.slice(2));
packOne(options.media, options.outDir, options.ignoreBand, "work");
for (const ref of options.refs) packOne(ref, join(options.outDir, "ref"), options.ignoreBand, "reference");
