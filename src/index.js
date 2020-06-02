import express from 'express';
import fetch from 'node-fetch';
import { addThumbnailsToMediaComposition } from './services/Thumbnails';

const app = express();
const IL = 'https://il.srgssr.ch/integrationlayer/2.0/mediaComposition/byUrn/';
const port = process.env.PORT || 3000;

app.get('/integrationlayer/2.0/mediaComposition/byUrn/:urn', async (req, res) => {
    const { urn } = req.params;
    if(urn) {
        try {
            const response = await fetch(`${IL}${urn}.json`);
            let mediaComposition = await response.json();
            mediaComposition = await addThumbnailsToMediaComposition(mediaComposition, urn);
            return res.send(mediaComposition);
        } catch (error) {
            return res.json({reason: 'Could not retrieve mediaComposition', error});
        }
    }
    return res.send('URN not provided');
});

app.use('/statics', express.static('statics'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));