const BASE_FEED_URL =
    "https://hdzog.com/admin/feeds/embed/";

const SOURCE = "815139609";


/*
 * ==========================================
 * VALID CATEGORIES
 * ==========================================
 */

const VALID_CATEGORIES = new Set([
    "African",
    "Albanian",
    "Algerian",
    "Amateur",
    "American",
    "Arab",
    "Armenian",
    "Asian",
    "Australian",
    "Austrian",
    "Azeri",
    "BBW",
    "BDSM",
    "Babe",
    "Bangladeshi",
    "Beach",
    "Behind The Scenes",
    "Belgian",
    "Big Ass",
    "Big Tits",
    "Bisexual Male",
    "Blonde",
    "Bolivian",
    "Bosnian",
    "Brazilian",
    "British",
    "Brunette",
    "Cambodian",
    "Canadian",
    "Car",
    "Casting",
    "Celebrity",
    "Chilean",
    "Close-up",
    "Colombian",
    "Compilation",
    "Cosplay",
    "Costa Rican",
    "Couple",
    "Croatian",
    "Cuban",
    "Czech",
    "Dominican",
    "Ecuadorian",
    "Egyptian",
    "Emo Girl",
    "Estonian",
    "European",
    "French",
    "German",
    "Greek",
    "Guatemalan",
    "HD",
    "Hairy",
    "Indian",
    "Indonesian",
    "Interracial",
    "Iranian",
    "Irish",
    "Israeli",
    "Italian",
    "Jamaican",
    "Japanese",
    "Jewish",
    "JAV Uncensored",
    "Korean",
    "Latina",
    "Latvian",
    "Lebanese",
    "Lesbian",
    "Lingerie",
    "Lithuanian",
    "MILF",
    "Macedonian",
    "Malaysian",
    "Massage",
    "Mature",
    "Mexican",
    "Moldavian",
    "Moroccan",
    "Nigerian",
    "Norwegian",
    "Outdoor",
    "POV",
    "Pakistani",
    "Panamanian",
    "Peruvian",
    "Piercing",
    "Pornstar",
    "Public",
    "Puerto Rican",
    "Red Head",
    "Romanian",
    "Secretary",
    "Shaved",
    "Singaporean",
    "Slovakian",
    "Slovenian",
    "Spanish",
    "Sports",
    "Sri Lankan",
    "Stockings",
    "Straight",
    "Swiss",
    "Tattoo",
    "Thai",
    "Threesome",
    "Tunisian",
    "Ukrainian",
    "Uniform",
    "Venezuelan",
    "Vintage",
    "Voyeur",
    "Webcam"
]);


/*
 * ==========================================
 * AFRICAN CATEGORIES
 * ==========================================
 */

const AFRICAN_CATEGORIES = [
    "African",
    "Nigerian",
    "Moroccan",
    "Egyptian",
    "Algerian",
    "Tunisian",
    "Jamaican"
];


/*
 * ==========================================
 * BUILD FEED URL
 * ==========================================
 */

function buildFeedUrl({
    category = "",
    sorting = "post_date",
    days = "7",
    limit = "100"
} = {}) {

    const params =
        new URLSearchParams();


    if (
        category &&
        VALID_CATEGORIES.has(category)
    ) {

        params.set(
            "categories",
            category
        );

    }


    params.set(
        "source",
        SOURCE
    );


    params.set(
        "only_hd",
        "on"
    );


    params.set(
        "feed_format",
        "csv"
    );


    params.set(
        "screenshot_format",
        "300x169"
    );


    params.set(
        "sorting",
        sorting
    );


    params.set(
        "days",
        days
    );


    params.set(
        "limit",
        limit
    );


    params.set(
        "player_width",
        "100%"
    );


    params.set(
        "player_height",
        "560"
    );


    params.set(
        "csv_separator",
        "|"
    );


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


    return (
        `${BASE_FEED_URL}?${params.toString()}`
    );

}


/*
 * ==========================================
 * CSV LINE PARSER
 * ==========================================
 */

function parseCSVLine(line) {

    const values = [];

    let current = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const char =
            line[i];


        if (
            char === '"'
        ) {

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                current += '"';

                i++;

                continue;

            }


            insideQuotes =
                !insideQuotes;

            continue;

        }


        if (
            char === "|" &&
            !insideQuotes
        ) {

            values.push(
                current
            );

            current = "";

        }
        else {

            current += char;

        }

    }


    values.push(
        current
    );


    return values;

}


/*
 * ==========================================
 * PARSE COMPLETE CSV
 * ==========================================
 */

function parseCSVFeed(csv) {

    const lines =
        csv
            .split(/\r?\n/)
            .filter(
                line =>
                    line.trim()
            );


    if (
        lines.length < 2
    ) {

        return {
            headers: [],
            rows: []
        };

    }


    const headers =
        parseCSVLine(
            lines[0]
        );


    const rows = [];


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const values =
            parseCSVLine(
                lines[i]
            );


        if (
            values.length
        ) {

            rows.push(
                values
            );

        }

    }


    return {
        headers,
        rows
    };

}


/*
 * ==========================================
 * FETCH ONE CATEGORY
 * ==========================================
 */

async function fetchCategory(
    category,
    sorting,
    days,
    limit
) {

    const url =
        buildFeedUrl({

            category,

            sorting,

            days,

            limit

        });


    const response =
        await fetch(
            url,
            {
                headers: {
                    "User-Agent":
                        "AfterDarkXX/1.0"
                }
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `${category} returned ${response.status}`
        );

    }


    return await response.text();

}


/*
 * ==========================================
 * GET COMBINED AFRICAN FEED
 * ==========================================
 */

async function getAfricanFeed({
    sorting = "post_date",
    days = "0",
    limit = "500"
} = {}) {

    const results =
        await Promise.allSettled(

            AFRICAN_CATEGORIES.map(
                category =>
                    fetchCategory(
                        category,
                        sorting,
                        days,
                        "100"
                    )
            )

        );


    let headers = [];

    const allRows = [];


    for (
        const result of results
    ) {

        if (
            result.status !==
            "fulfilled"
        ) {

            console.error(
                "African category failed:",
                result.reason
            );

            continue;

        }


        const parsed =
            parseCSVFeed(
                result.value
            );


        if (
            !headers.length
        ) {

            headers =
                parsed.headers;

        }


        allRows.push(
            ...parsed.rows
        );

    }


    if (
        !headers.length
    ) {

        throw new Error(
            "African feeds returned no data"
        );

    }


    /*
     * ==========================================
     * REMOVE DUPLICATES
     * ==========================================
     */

    const idIndex =
        headers.indexOf("ID");


    const seen =
        new Set();


    const uniqueRows =
        allRows.filter(
            row => {

                const id =
                    idIndex >= 0
                        ? String(
                            row[idIndex] || ""
                        ).trim()
                        : "";


                if (
                    !id
                ) {

                    return true;

                }


                if (
                    seen.has(id)
                ) {

                    return false;

                }


                seen.add(id);

                return true;

            }
        );


    /*
     * ==========================================
     * SORT NEWEST
     * ==========================================
     */

    const dateIndex =
        headers.indexOf(
            "Publish date, time"
        );


    if (
        sorting === "post_date" &&
        dateIndex >= 0
    ) {

        uniqueRows.sort(
            (a, b) =>
                String(
                    b[dateIndex] || ""
                ).localeCompare(
                    String(
                        a[dateIndex] || ""
                    )
                )
        );

    }


    /*
     * ==========================================
     * SORT RATING
     * ==========================================
     */

    const ratingIndex =
        headers.indexOf(
            "Rating"
        );


    if (
        sorting === "rating" &&
        ratingIndex >= 0
    ) {

        uniqueRows.sort(
            (a, b) =>
                Number(
                    b[ratingIndex] || 0
                ) -
                Number(
                    a[ratingIndex] || 0
                )
        );

    }


    /*
     * ==========================================
     * FINAL LIMIT
     * ==========================================
     */

    const finalRows =
        uniqueRows.slice(
            0,
            Number(limit)
        );


    return [
        headers.join("|"),

        ...finalRows.map(
            row =>
                row
                    .map(
                        value => {

                            const text =
                                String(
                                    value ?? ""
                                );


                            if (
                                text.includes("|") ||
                                text.includes('"') ||
                                text.includes("\n") ||
                                text.includes("\r")
                            ) {

                                return `"${text.replace(
                                    /"/g,
                                    '""'
                                )}"`;

                            }


                            return text;

                        }
                    )
                    .join("|")
        )

    ].join("\n");

}


/*
 * ==========================================
 * HERO THUMBNAIL
 * ==========================================
 */

function getHeroThumbnail(csv) {

    const lines =
        csv
            .split(/\r?\n/)
            .filter(
                line =>
                    line.trim()
            );


    if (
        lines.length < 2
    ) {

        return null;

    }


    const headers =
        parseCSVLine(
            lines[0]
        );


    const mainThumbIndex =
        headers.indexOf(
            "Main thumbnail"
        );


    const thumbsIndex =
        headers.indexOf(
            "Thumbnails"
        );


    const validRows = [];


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const values =
            parseCSVLine(
                lines[i]
            );


        const mainThumb =
            mainThumbIndex >= 0
                ? values[mainThumbIndex]
                : "";


        const thumbnails =
            thumbsIndex >= 0
                ? values[thumbsIndex]
                : "";


        let thumbnail =
            mainThumb;


        if (
            !thumbnail &&
            thumbnails
        ) {

            thumbnail =
                thumbnails
                    .split(",")[0]
                    .trim();

        }


        if (
            thumbnail
        ) {

            validRows.push(
                thumbnail
            );

        }

    }


    if (
        !validRows.length
    ) {

        return null;

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            validRows.length
        );


    return validRows[
        randomIndex
    ];

}


/*
 * ==========================================
 * MAIN HANDLER
 * ==========================================
 */

exports.handler =
    async function(event) {

        try {

            const query =
                event.queryStringParameters ||
                {};


            /*
             * ==========================================
             * HERO MODE
             * ==========================================
             */

            if (
                query.hero === "1"
            ) {

                const heroFeedUrl =
                    buildFeedUrl({

                        sorting:
                            "post_date",

                        days:
                            "7",

                        limit:
                            "100"

                    });


                const response =
                    await fetch(
                        heroFeedUrl,
                        {
                            headers: {
                                "User-Agent":
                                    "AfterDarkXX/1.0"
                            }
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        `TubeCorporate returned ${response.status}`
                    );

                }


                const csv =
                    await response.text();


                const thumbnail =
                    getHeroThumbnail(
                        csv
                    );


                if (
                    !thumbnail
                ) {

                    throw new Error(
                        "No hero thumbnail found"
                    );

                }


                const imageResponse =
                    await fetch(
                        thumbnail,
                        {
                            headers: {
                                "User-Agent":
                                    "AfterDarkXX/1.0"
                            }
                        }
                    );


                if (
                    !imageResponse.ok
                ) {

                    throw new Error(
                        `Thumbnail returned ${imageResponse.status}`
                    );

                }


                const contentType =
                    imageResponse.headers.get(
                        "content-type"
                    ) ||
                    "image/jpeg";


                const imageBuffer =
                    await imageResponse.arrayBuffer();


                return {

                    statusCode:
                        200,

                    headers: {

                        "Content-Type":
                            contentType,

                        "Cache-Control":
                            "public, max-age=1800, s-maxage=1800"

                    },

                    body:
                        Buffer
                            .from(
                                imageBuffer
                            )
                            .toString(
                                "base64"
                            ),

                    isBase64Encoded:
                        true

                };

            }


            /*
             * ==========================================
             * AFRICAN MODE
             * ==========================================
             */

            if (
                query.african === "1"
            ) {

                let africanLimit =
                    parseInt(
                        query.limit ||
                        "500",
                        10
                    );


                if (
                    !Number.isFinite(
                        africanLimit
                    ) ||
                    africanLimit < 1
                ) {

                    africanLimit =
                        500;

                }


                africanLimit =
                    Math.min(
                        africanLimit,
                        500
                    );


                const africanCSV =
                    await getAfricanFeed({

                        sorting:
                            "post_date",

                        days:
                            "0",

                        limit:
                            String(
                                africanLimit
                            )

                    });


                return {

                    statusCode:
                        200,

                    headers: {

                        "Content-Type":
                            "text/plain; charset=utf-8",

                        "Cache-Control":
                            "public, max-age=900, s-maxage=900",

                        "Access-Control-Allow-Origin":
                            "*"

                    },

                    body:
                        africanCSV

                };

            }


            /*
             * ==========================================
             * NORMAL FEED
             * ==========================================
             */

            let category =
                String(
                    query.category ||
                    ""
                ).trim();


            let sorting =
                query.sort ||
                "post_date";


            let days =
                query.days ||
                "7";


            let limit =
                query.limit ||
                "100";


            /*
             * CATEGORY VALIDATION
             */

            if (
                category &&
                !VALID_CATEGORIES.has(
                    category
                )
            ) {

                category =
                    "";

            }


            /*
             * SORTING VALIDATION
             */

            const allowedSorting =
                new Set([
                    "post_date",
                    "rating",
                    "popularity",
                    "duration",
                    "id"
                ]);


            if (
                !allowedSorting.has(
                    sorting
                )
            ) {

                sorting =
                    "post_date";

            }


            /*
             * DAYS VALIDATION
             */

            const allowedDays =
                new Set([
                    "1",
                    "7",
                    "30",
                    "0"
                ]);


            if (
                !allowedDays.has(
                    days
                )
            ) {

                days =
                    "7";

            }


            /*
             * LIMIT
             */

            let numericLimit =
                parseInt(
                    limit,
                    10
                );


            if (
                !Number.isFinite(
                    numericLimit
                ) ||
                numericLimit < 1
            ) {

                numericLimit =
                    100;

            }


            numericLimit =
                Math.min(
                    numericLimit,
                    500
                );


            /*
             * BUILD FEED
             */

            const feedUrl =
                buildFeedUrl({

                    category,

                    sorting,

                    days,

                    limit:
                        String(
                            numericLimit
                        )

                });


            console.log(
                "AfterDarkXX feed request:",
                {
                    category:
                        category ||
                        "ALL",

                    sorting,

                    days,

                    limit:
                        numericLimit
                }
            );


            const response =
                await fetch(
                    feedUrl,
                    {
                        headers: {

                            "User-Agent":
                                "AfterDarkXX/1.0"

                        }
                    }
                );


            if (
                !response.ok
            ) {

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

                statusCode:
                    200,

                headers: {

                    "Content-Type":
                        "text/plain; charset=utf-8",

                    "Cache-Control":
                        "public, max-age=900, s-maxage=900",

                    "Access-Control-Allow-Origin":
                        "*"

                },

                body:
                    csv

            };

        }
        catch (
            error
        ) {

            console.error(
                "AfterDarkXX feed error:",
                error
            );


            return {

                statusCode:
                    502,

                headers: {

                    "Content-Type":
                        "application/json; charset=utf-8",

                    "Cache-Control":
                        "no-store"

                },

                body:
                    JSON.stringify({

                        error:
                            "Unable to load the video feed."

                    })

            };

        }

    };
