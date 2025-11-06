import axios from "axios";
import fs from "fs";
import path from "path";
import extract from "extract-zip";

export async function downloadAndExtractZip(url: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipFileName = `tmp/data-${timestamp}.zip`;
    const zipPath = path.join(process.cwd(), zipFileName);
    const extractPath = path.join(process.cwd(), "data");

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

    response.data.on("data", (chunk: string | any[]) => {
        downloaded += chunk.length;
        if (totalLength > 0) {
            const percent = Math.floor((downloaded / totalLength) * 100);
            if (percent !== lastPercent && percent % 2 === 0) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`📥 Downloading... ${percent}%`);
                lastPercent = percent;
            }
        }
    });

    await new Promise<void>((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });

    process.stdout.write("\n✅ ZIP downloaded.\n");

    console.log("📦 Extracting ZIP...");
    try {
        await extract(zipPath, { dir: extractPath });
        console.log("✅ ZIP extracted to:", extractPath);
    } catch (err) {
        console.error("❌ Extraction failed:", err);
        throw err;
    }

    // Cleanup
    try {
        fs.unlinkSync(zipPath);
        console.log(`🧹 Deleted temporary file: ${zipFileName}`);
    } catch (err) {
        console.warn(`⚠️ Could not delete ${zipFileName}:`, err);
    }

    console.log("✨ Done.");
}
