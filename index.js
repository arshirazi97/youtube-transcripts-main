const fs = require('fs')
const YoutubeMp3Downloader = require('youtube-mp3-downloader')
const { Deepgram } = require('@deepgram/sdk')
const ffmpeg = require('ffmpeg-static')

const deepgram = new Deepgram('941b10c00c345193e75ae8bed7dae92f86617252')
const YD = new YoutubeMp3Downloader({
  ffmpegPath: ffmpeg,
  outputPath: './',
  youtubeVideoQuality: 'highestaudio'
})

if (process.argv.length < 3) {
  console.log('Please enter a YouTube video URL')
  process.exit()
}

const videoUrl = process.argv[2]

YD.download(videoUrl)

YD.on('progress', data => {
  console.log(data.progress.percentage + '% downloaded')
})

YD.on('finished', async (err, video) => {
  const videoFileName = video.file
  console.log(`Downloaded ${videoFileName}`)

  const file = {
    buffer: fs.readFileSync(videoFileName),
    mimetype: 'audio/mp3'
  }
  const options = {
    punctuate: true
  }

  const result = await deepgram.transcription.preRecorded(file, options).catch(e => console.log(e))
  const transcript = result.results.channels[0].alternatives[0].transcript

  fs.writeFileSync(`${videoFileName}.txt`, transcript, () => `Wrote ${videoFileName}.txt`)
  fs.unlinkSync(videoFileName)
})
