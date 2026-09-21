const FEED_URL =
    "https://hdzog.com/admin/feeds/embed/?categories=African%2CAlbanian%2CAlgerian%2CAmateur%2CAmerican%2CAnal%2CArab%2CArmenian%2CAsian%2CAss%20to%20Mouth%2CAustralian%2CAustrian%2CAzeri%2CBBW%2CBDSM%2CBabe%2CBabysitter%2CBangladeshi%2CBeach%2CBehind%20The%20Scenes%2CBelgian%2CBig%20Ass%2CBig%20Cock%2CBig%20Tits%2CBisexual%20Male%2CBlonde%2CBlowjob%2CBolivian%2CBondage%2CBosnian%2CBrazilian%2CBritish%2CBrunette%2CBukkake%2CCambodian%2CCanadian%2CCar%2CCasting%2CCelebrity%2CChilean%2CClose-up%2CColombian%2CCompilation%2CCosplay%2CCosta%20Rican%2CCouple%2CCowgirl%2CCream%20Pie%2CCroatian%2CCuban%2CCuckold%2CCum%20In%20Mouth%2CCumshot%2CCunnilingus%2CCzech%2CDeepthroat%2CDevice%20Bondage%2CDoggystyle%2CDomination%2CDouble%20Penetration%2CEbony%2CEcuadorian%2CEgyptian%2CEmo%20Girl%2CEstonian%2CEuropean%2CFace%20Sitting%2CFacial%2CFemale%20Orgasm%2CFemdom%2CFetish%2CFingering%2CFinnish%2CFisting%2CFoot%20Fetish%2CFootjob%2CFrench%2CFuck%20Machine%2CGagging%2CGangbang%2CGaping%2CGerman%2CGlory%20Hole%2CGranny%2CGreek%2CGroup%20sex%2CGuatemalan%2CHD%2CHairy%2CHandcuffs%2CHandjob%2CHanging%2CHardcore%2CHigh%20Heels%2CHogtied%2CHumiliation%2CIndian%2CIndonesian%2CInterracial%2CIranian%2CIrish%2CIsraeli%2CItalian%2CJAV%20Uncensored%2CJamaican%2CJapanese%2CJewish%2CLactating%2CLatex%2CLatina%2CLatvian%2CLebanese%2CLesbian%2CLingerie%2CLithuanian%2CMILF%2CMacedonian%2CMalaysian%2CMassage%2CMasturbation%2CMature%2CMistress%2CMoldavian%2CMoroccan%2CMuscular%20Man%2CNigerian%2CNipples%2CNorwegian%2COld%20and%20Young%2COutdoor%2CPOV%2CPakistani%2CPanamanian%2CPegging%2CPeruvian%2CPiercing%2CPissing%2CPornstar%2CPregnant%2CPublic%2CPuerto%20Rican%2CRed%20Head%2CRimming%2CRomanian%2CRomantic%2CRussian%2CSecretary%2CShaved%2CShemale%2CShibari%20Bondage%2CSingaporean%2CSkinny%2CSlovakian%2CSlovenian%2CSmall%20Tits%2CSmoking%2CSoftcore%2CSolo%20Female%2CSouth%20African%2CSpandex%2CSpanish%2CSpanking%2CSports%2CSquirt%2CSri%20Lankan%2CStep%20Fantasy%2CStockings%2CStraight%2CStrapon%2CStriptease%2CSubmissive%2CSwallow%20Cum%2CSwingers%2CSwiss%2CTattoo%2CTeacher%2CTeens%2CThai%2CThreesome%2CToys%2CTunisian%2CUkrainian%2CUniform%2CUpskirt%2CVenezuelan%2CVintage%2CVoyeur%2CWebcam%2CWhipping&source=815139609&only_hd=on&feed_format=csv&screenshot_format=300x169&sorting=post_date&days=7&limit=100&player_width=100%25&player_height=560&csv_separator=%7C&csv_columns=id%7Ctitle%7Cdescription%7Clink%7Cduration%7Crating%7Cpost_date%7Ccategories%7Ctags%7Cembed%7Cmain_screenshot%7Cscreenshots";


exports.handler = async function () {

    try {

        const response =
            await fetch(FEED_URL, {
                headers: {
                    "User-Agent":
                        "AfterDarkX Feed Proxy"
                }
            });


        if (!response.ok) {

            return {
                statusCode: response.status,
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    error:
                        "Unable to retrieve video feed."
                })
            };

        }


        const data =
            await response.text();


        return {

            statusCode: 200,

            headers: {

                "Content-Type":
                    "text/plain; charset=utf-8",

                "Cache-Control":
                    "public, max-age=900"

            },

            body: data

        };

    } catch (error) {

        console.error(
            "TubeCorporate feed error:",
            error
        );


        return {

            statusCode: 500,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                error:
                    "Feed service temporarily unavailable."
            })

        };

    }

};
