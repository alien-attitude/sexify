
// Helper
export const errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
};

const classify = async (req, res) => {
    const {name} = req.query;

    // 422 — name present but not a string (e.g. array: ?name[]=foo)
    if (name !== undefined && typeof name !== "string") {
        return errorResponse(res, 422, "name must be a string");
    }

    // 400 — missing or empty
    if (!name || name.trim() === "") {
        return errorResponse(res, 400, "Missing or empty name parameter");
    }

    const trimmedName = name.trim();

    // Call genderize
    let genderizeData;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500); // leave room under 500ms rule

        const upstream = await fetch(
            `https://api.genderize.io/?name=${encodeURIComponent(trimmedName)}`,
            { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!upstream.ok) {
            return errorResponse(res, 502, "Upstream API returned an error");
        }

        genderizeData = await upstream.json();
    } catch (err) {
        if (err.name === "AbortError") {
            return errorResponse(res, 502, "Upstream API timed out");
        }
        return errorResponse(res, 500, "Failed to reach upstream API");
    }

    // Edge cases: null gender/ zero counts
    const rawCount = genderizeData.count;
    const rawGender = genderizeData.gender;

    if (rawGender === null || rawGender === undefined || rawCount === null || rawCount === 0) {
        return errorResponse(res, 422, "No prediction available for the provided name");
    }

    // Process
    const probability  = Number(genderizeData.probability);
    const sample_size  = Number(rawCount);

    // Both conditions must be true; explicit boolean cast avoids any coercion edge case
    const is_confident = Boolean(probability >= 0.7 && sample_size >= 100);

    return res.status(200).json({
        status: "success",
        data: {
            name: genderizeData.name,
            gender: genderizeData.gender,
            probability,
            sample_size,
            is_confident,
            processed_at: new Date().toISOString(),
        },
    });
};


export default classify;