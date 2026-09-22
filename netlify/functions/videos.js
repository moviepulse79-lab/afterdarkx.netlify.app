const BASE_FEED_URL =
    "https://hdzog.com/admin/feeds/embed/";

const SOURCE =
    "815139609";

const EMBED_CAMPAIGN =
    "26590";


/*
=========================================================
ALLOWED CATEGORY NAMES

These match categories available from the TubeCorporate feed.
=========================================================
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
    "Skinny",
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
=========================================================
HELPERS
=========================================================
*/

function buildFeedUrl({
    category = "",
    sorting = "post_date",
    days = "7",
    limit = "100"
} = {}) {

    const params = new URLSearchParams();

    /*
    Only add a category when one was requested.
    This prevents the homepage from being locked
    to one giant category list.
    */

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


/*
=========================================================
REQUEST HANDLER
=========================================================
*/

exports.handler = async function (event) {

    try {

        const query =
            event.queryStringParameters || {};

        let category =
            query.category || "";

        let sorting =
            query.sort || "post_date";

        let days =
            query.days || "7";

        let limit =
            query.limit || "100";


        /*
        Clean category input
        */

        category =
            String(category).trim();


        /*
        Supported sorting modes
        */

        const allowedSorting = new Set([
            "post_date",
            "rating",
            "popularity",
            "duration",
            "id"
        ]);

        if (!allowedSorting.has(sorting)) {
            sorting = "post_date";
        }


        /*
        Keep values reasonable.
        */

        const allowedDays = new Set([
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
            Math.min(numericLimit, 100);


        /*
        Build authorized TubeCorporate feed URL
        */

        const feedUrl =
            buildFeedUrl({
                category,
                sorting,
                days,
                limit: String(numericLimit)
            });


        console.log(
            "AfterDarkX feed request:",
            {
                category: category || "ALL",
                sorting,
                days,
                limit: numericLimit
            }
        );


        /*
        Fetch feed
        */

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


        /*
        Return CSV to frontend
        */

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
