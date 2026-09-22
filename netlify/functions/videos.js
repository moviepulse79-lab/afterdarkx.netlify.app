const BASE_FEED_URL =
    "https://hdzog.com/admin/feeds/embed/";

const SOURCE = "815139609";

const VALID_CATEGORIES = new Set([
    "African","Albanian","Algerian","Amateur","American","Arab","Armenian",
    "Asian","Australian","Austrian","Azeri","BBW","BDSM","Babe","Bangladeshi",
    "Beach","Behind The Scenes","Belgian","Big Ass","Big Tits","Bisexual Male",
    "Blonde","Bolivian","Bosnian","Brazilian","British","Brunette","Cambodian",
    "Canadian","Car","Casting","Celebrity","Chilean","Close-up","Colombian",
    "Compilation","Cosplay","Costa Rican","Couple","Croatian","Cuban","Czech",
    "Dominican","Ecuadorian","Egyptian","Emo Girl","Estonian","European","French",
    "German","Greek","Guatemalan","HD","Hairy","Indian","Indonesian","Interracial",
    "Iranian","Irish","Israeli","Italian","Jamaican","Japanese","Jewish",
    "JAV Uncensored","Korean","Latina","Latvian","Lebanese","Lesbian","Lingerie",
    "Lithuanian","MILF","Macedonian","Malaysian","Massage","Mature","Mexican",
    "Moldavian","Moroccan","Nigerian","Norwegian","Outdoor","POV","Pakistani",
    "Panamanian","Peruvian","Piercing","Pornstar","Public","Puerto Rican",
    "Red Head","Romanian","Secretary","Shaved","Singaporean","Skinny","Slovakian",
    "Slovenian","Spanish","Sports","Sri Lankan","Stockings","Straight","Swiss",
    "Tattoo","Thai","Threesome","Tunisian","Ukrainian","Uniform","Venezuelan",
    "Vintage","Voyeur","Webcam"
]);

function buildFeedUrl({
    category = "",
    sorting = "post_date",
    days = "7",
    limit = "100"
} = {}) {

    const params = new URLSearchParams();

    if (category && VALID_CATEGORIES.has(category)) {
        params.set("categories", category);
    }

    params.set("source", SOURCE);
    params.set("only_hd", "on");
    params.set("feed_format", "csv");
    params.set("screenshot_format", "300x169");
    params.set("sorting", sorting);
    params.set("days", days);
    params.set("limit", limit);
    params.set("player_width", "100%");
    params.set("player_height", "560");
    params.set("csv_separator", "|");

    params.set(
        "csv_columns",
        [
            "id",
            "title",
            "description",
            "link",
            "duration",
            "rating",
            "post_date",
            "categories",
            "tags",
            "embed",
            "main_screenshot",
            "screenshots"
        ].join("|")
    );

    return `${BASE_FEED_URL}?${params.toString()}`;
}

function parseCSVLine(line) {

    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {

        const char = line[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (char === "|" && !insideQuotes) {
            values.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    values.push(current);

    return values;
}

function getHeroThumbnail(csv) {

    const lines = csv
        .split(/\r?\n/)
        .filter(line => line.trim());

    if (lines.length < 2) {
        return null;
    }

    const headers = parseCSVLine(lines[0]);

    const mainThumbIndex =
        headers.indexOf("Main thumbnail");

    const thumbsIndex =
        headers.indexOf("Thumbnails");

    const validRows = [];

    for (let i = 1; i < lines.length; i++) {

        const values = parseCSVLine(lines[i]);

        const mainThumb =
            mainThumbIndex >= 0
                ? values[mainThumbIndex]
                : "";

        const thumbnails =
            thumbsIndex >= 0
                ? values[thumbsIndex]
                : "";

        let thumbnail = mainThumb;

        if (!thumbnail && thumbnails) {
            thumbnail =
                thumbnails
                    .split(",")[0]
                    .trim();
        }

        if (thumbnail) {
            validRows.push(thumbnail);
        }
    }

    if (!validRows.length) {
        return null;
    }

    const randomIndex =
        Math.floor(Math.random() * validRows.length);

    return validRows[randomIndex];
}

exports.handler = async function (event) {

    try {

        const query =
            event.queryStringParameters || {};

        /*
         * ==========================================
         * HERO IMAGE MODE
         * /api/videos?hero=1
         * ==========================================
         */

        if (query.hero === "1") {

            const heroFeedUrl =
                buildFeedUrl({
                    sorting: "post_date",
                    days: "7",
                    limit: "100"
                });

            const response =
                await fetch(heroFeedUrl, {
                    headers: {
                        "User-Agent": "AfterDarkX/1.0"
                    }
                });

            if (!response.ok) {
                throw new Error(
                    `TubeCorporate returned ${response.status}`
                );
            }

            const csv =
                await response.text();

            const thumbnail =
                getHeroThumbnail(csv);

            if (!thumbnail) {
                throw new Error(
                    "No hero thumbnail found"
                );
            }

            /*
             * Fetch thumbnail through our server.
             * The browser therefore does not directly
             * request the TubeCorporate thumbnail URL.
             */

            const imageResponse =
                await fetch(thumbnail, {
                    headers: {
                        "User-Agent": "AfterDarkX/1.0"
                    }
                });

            if (!imageResponse.ok) {
                throw new Error(
                    `Thumbnail returned ${imageResponse.status}`
                );
            }

            const contentType =
                imageResponse.headers.get(
                    "content-type"
                ) || "image/jpeg";

            const imageBuffer =
                await imageResponse.arrayBuffer();

            return {
                statusCode: 200,

                headers: {
                    "Content-Type": contentType,
                    "Cache-Control":
                        "public, max-age=1800, s-maxage=1800"
                },

                body: Buffer.from(
                    imageBuffer
                ).toString("base64"),

                isBase64Encoded: true
            };
        }

        /*
         * ==========================================
         * NORMAL CSV MODE
         * ==========================================
         */

        let category =
            String(
                query.category || ""
            ).trim();

        let sorting =
            query.sort || "post_date";

        let days =
            query.days || "7";

        let limit =
            query.limit || "100";

        const allowedSorting =
            new Set([
                "post_date",
                "rating",
                "popularity",
                "duration",
                "id"
            ]);

        if (!allowedSorting.has(sorting)) {
            sorting = "post_date";
        }

        const allowedDays =
            new Set([
                "1",
                "7",
                "30",
                "0"
            ]);

        if (!allowedDays.has(days)) {
            days = "7";
        }

        let numericLimit =
            parseInt(limit, 10);

        if (
            !Number.isFinite(numericLimit) ||
            numericLimit < 1
        ) {
            numericLimit = 100;
        }

        numericLimit =
            Math.min(
                numericLimit,
                100
            );

        const feedUrl =
            buildFeedUrl({
                category,
                sorting,
                days,
                limit:
                    String(numericLimit)
            });

        console.log(
            "AfterDarkX feed request:",
            {
                category:
                    category || "ALL",
                sorting,
                days,
                limit:
                    numericLimit
            }
        );

        const response =
            await fetch(feedUrl, {
                headers: {
                    "User-Agent":
                        "AfterDarkX/1.0"
                }
            });

        if (!response.ok) {
            throw new Error(
                `TubeCorporate returned ${response.status}`
            );
        }

        const csv =
            await response.text();

        if (
            !csv ||
            !csv.trim()
        ) {
            throw new Error(
                "TubeCorporate returned an empty feed"
            );
        }

        return {
            statusCode: 200,

            headers: {
                "Content-Type":
                    "text/plain; charset=utf-8",

                "Cache-Control":
                    "public, max-age=900, s-maxage=900",

                "Access-Control-Allow-Origin":
                    "*"
            },

            body: csv
        };

    } catch (error) {

        console.error(
            "AfterDarkX feed error:",
            error
        );

        return {
            statusCode: 502,

            headers: {
                "Content-Type":
                    "application/json; charset=utf-8",

                "Cache-Control":
                    "no-store"
            },

            body: JSON.stringify({
                error:
                    "Unable to load the video feed."
            })
        };
    }
};
