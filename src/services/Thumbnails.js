import tmp from 'tmp';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs').promises;

const getMediaResource = ({ chapterList: [{ resourceList: [{ url = null, mimeType = null}] = null } = null] = null }) => ({
  url, mimeType
});

const isMP4Media = mimeType => mimeType === 'video/mp4';

const isSpriteSheetAlreadyExisting = async (urn) => {
    try {
        await fs.access(`statics/${urn}.jpg`);
        return true;
    } catch {
        return false;
    }
}

const addThumbnailsToMediaComposition = async (media, urn) => {
    const { url, mimeType } = getMediaResource(media);
    if(isMP4Media(mimeType)) {
        const globalSpriteSheet = {
            thumbnailHeight : 120,
            thumbnailWidth : 180,
            rows : 11,
            cols : 16,
            period : 1,
            url : `https://il-spritesheet-demo.herokuapp.com/statics/${urn}.jpg`,
        }
        const isSpriteSheetExisting = await isSpriteSheetAlreadyExisting(urn);
        if(!isSpriteSheetExisting) {
            await createSpriteSheet(url, urn);
        }
        const [mainChapterList, ...chapters] = media.chapterList;
        mainChapterList.globalSpriteSheet = globalSpriteSheet;
        return {...media, chapterList: [mainChapterList, ...chapters]}
    }
}

const createSpriteSheet = async (url, urn) => {
    const tmpFolder = tmp.dirSync({ unsafeCleanup : true });
    const ffpegCommand = `ffmpeg -i ${url} -vf fps=1 -s 180x120 -f image2 ${tmpFolder.name}/thumb-%03d.jpg`;
    const montageCommand = `montage ${tmpFolder.name}/thumb-*.jpg -geometry +0+0 -quality 40 -tile 16x ${process.cwd()}/statics/${urn}.jpg`;

    try {
        await exec(ffpegCommand);
        await exec(montageCommand);
    } catch (error) {
        console.log(error);
    }

    tmpFolder.removeCallback();
}

export { addThumbnailsToMediaComposition };
