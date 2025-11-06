import axios from "axios";
import fs from "fs";
import path from "path";
import { createReadStream } from "fs";
import * as unzipper from "unzipper";

export async function extractLargeZip(zipPath: string, extractPath: string) {
  return new Promise<void>((resolve, reject) => {
    createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .on("close", resolve)
      .on("error", reject);
  });
}

export async function downloadAndExtractZip(url: string, name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipFileName = `tmp/data-${name}.zip`;
    const zipPath = path.join(process.cwd(), zipFileName);
    const extractPath = path.join(process.cwd(), "data");

    // Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
        console.log(`📁 Created directory: ${tmpDir}`);
    }

    // Get remote file size first
    console.log(`🔍 Checking remote file size...`);
    const headResponse = await axios({
        url,
        method: "HEAD",
    });
    const remoteSize = Number(headResponse.headers["content-length"]) || 0;

    // Check if local ZIP already exists with same size
    if (fs.existsSync(zipPath)) {
        const localStats = fs.statSync(zipPath);
        const localSize = localStats.size;

        if (remoteSize > 0 && localSize === remoteSize) {
            console.log(`✅ ZIP already exists with same size (${(localSize / 1024 / 1024).toFixed(2)} MB)`);
            console.log(`⏭️  Skipping download...`);
            console.log("📦 Extracting ZIP...");
            try {
                // Ensure the extraction directory exists with proper permissions
                if (!fs.existsSync(extractPath)) {
                    fs.mkdirSync(extractPath, { recursive: true, mode: 0o755 });
                    console.log(`📁 Created directory: ${extractPath}`);
                }

                // Verify write permissions
                try {
                    fs.accessSync(extractPath, fs.constants.W_OK);
                    console.log(`✓ Write permissions verified for: ${extractPath}`);
                } catch (permErr) {
                    console.error(`❌ No write permission for ${extractPath}`);
                    console.error(`   Please run: sudo chown -R $USER:$USER ${extractPath}`);
                    throw permErr;
                }

                await extractLargeZip(zipPath, extractPath);
                console.log("✅ ZIP extracted to:", extractPath);
                console.log("✨ Done.");
                return;
            } catch (err) {
                console.error("❌ Extraction failed:", err);
                throw err;
            }
        } else {
            console.log(`⚠️  Local ZIP exists but size differs (local: ${(localSize / 1024 / 1024).toFixed(2)} MB, remote: ${(remoteSize / 1024 / 1024).toFixed(2)} MB)`);
            console.log(`🗑️  Deleting old ZIP...`);
            fs.unlinkSync(zipPath);
        }
    }

    console.log(`⬇️ Downloading ZIP (${zipFileName})...`);

    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    const totalLength = Number(response.headers["content-length"]) || 0;
    console.log(
        totalLength
            ? `File size: ${(totalLength / 1024 / 1024).toFixed(2)} MB`
            : "File size unknown (no Content-Length header)",
    );

    const writer = fs.createWriteStream(zipPath);
    let downloaded = 0;
    let lastPercent = 0;
    const isTTY =
        process.stdout.isTTY && typeof process.stdout.clearLine === "function";

    response.data.on("data", (chunk: string | any[]) => {
        downloaded += chunk.length;
        if (totalLength > 0) {
            const percent = Math.floor((downloaded / totalLength) * 100);
            if (percent !== lastPercent && percent % 2 === 0) {
                if (isTTY) {
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    process.stdout.write(`📥 Downloading... ${percent}%`);
                } else {
                    // In non-TTY environments (like Docker), just log periodically
                    if (percent % 10 === 0) {
                        console.log(`📥 Downloading... ${percent}%`);
                    }
                }
                lastPercent = percent;
            }
        }
    });

    await new Promise<void>((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });

    if (isTTY) {
        process.stdout.write("\n");
    }
    console.log("✅ ZIP downloaded.");

    console.log("📦 Extracting ZIP...");
    try {
        // Ensure the extraction directory exists with proper permissions
        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true, mode: 0o755 });
            console.log(`📁 Created directory: ${extractPath}`);
        }

        // Verify write permissions
        try {
            fs.accessSync(extractPath, fs.constants.W_OK);
            console.log(`✓ Write permissions verified for: ${extractPath}`);
        } catch (permErr) {
            console.error(`❌ No write permission for ${extractPath}`);
            console.error(`   Please run: sudo chown -R $USER:$USER ${extractPath}`);
            throw permErr;
        }

        await extractLargeZip(zipPath, extractPath);
        console.log("✅ ZIP extracted to:", extractPath);
    } catch (err) {
        console.error("❌ Extraction failed:", err);
        throw err;
    }

    // Cleanup
    try {
        //fs.unlinkSync(zipPath);
        console.log(`🧹 Deleted temporary file: ${zipFileName}`);
    } catch (err) {
        console.warn(`⚠️ Could not delete ${zipFileName}:`, err);
    }

    console.log("✨ Done.");
}
