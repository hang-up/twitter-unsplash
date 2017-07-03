require('es6-promise').polyfill();
require('isomorphic-fetch');
const twitter = require('twitter')
const Unsplash = require('unsplash-js').default
const request = require('request').defaults({encoding: null})
const ora  = require('ora')
require('dotenv').config()

// Init twitter client.
const client = new twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

// Init unsplash client.
const unsplash = new Unsplash({
    applicationId: process.env.UNSPLASH_APP_ID,
    secret: process.env.UNSPLASH_SECRET,
    callbackUrl: process.env.UNSPLASH_CALLBACK
});

// Start spinner.
const spinner = ora("Fetching swag from Unsplash")
spinner.start()


/**
 * Fetch a pic from unsplash, encode it in base64, then upload it to twitter.
 *
 */
unsplash.photos.getRandomPhoto({
    collections: ['984260/minimal-twitter']
})
    .then(res => {
        return typeof res.json === "function" ? res.json() : res;
    })
    .then(json => {
        // Fetched successfully!
        spinner.info('Base64 encoding picture...')

        // Get the URL of the said picture.
        const url = json.urls.regular

        // Encode it in base64.
        request.get(url, (error, response, body) => {
            if (!error && response.statusCode === 200) {

                // Here is the madness.
                let image = new Buffer(body).toString('base64');

                // Encoded successfully!
                spinner.info('Posting picture to your Twitter account...')

                // Upload to twitter.
                initTwitterClient(image)
            }
        })

    })


/**
 * Make the call to twitter API.
 *
 * @param media
 */
function initTwitterClient(media) {
    // Twitter params.
    const params = {
        banner: media
    }
    // Update the profile banner.
    client.post('account/update_profile_banner', params, function (error, res, raw) {
        if (error) console.log(error);
        spinner.succeed('Profile banner updated!')
    });
}
