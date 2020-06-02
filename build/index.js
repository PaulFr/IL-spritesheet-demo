"use strict";

var _express = _interopRequireDefault(require("express"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _Thumbnails = require("./services/Thumbnails");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
const IL = 'https://il.srgssr.ch/integrationlayer/2.0/mediaComposition/byUrn/';
const port = 3000;
app.get('/media/:urn', async (req, res) => {
  const {
    urn
  } = req.params;

  if (urn) {
    try {
      const response = await (0, _nodeFetch.default)(`${IL}${urn}.json`);
      let mediaComposition = await response.json();
      mediaComposition = await (0, _Thumbnails.addThumbnailsToMediaComposition)(mediaComposition, urn);
      return res.send(mediaComposition);
    } catch (error) {
      return res.json({
        reason: 'Could not retrieve mediaComposition',
        error
      });
    }
  }

  return res.send('URN not provided');
});
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));