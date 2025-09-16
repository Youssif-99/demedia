import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

async function isImageClean(imageUrl) {
    const [result] = await client.safeSearchDetection(imageUrl);
    const detection = result.safeSearchAnnotation;

    if (
        ["LIKELY", "VERY_LIKELY"].includes(detection.adult) ||
        ["LIKELY", "VERY_LIKELY"].includes(detection.violence) ||
        ["LIKELY", "VERY_LIKELY"].includes(detection.racy)
    ) {
        return false; // مرفوض
    }
    return true;
}
