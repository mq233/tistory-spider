const config = require('./config'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    axios = require('axios'),
    SocksProxyAgent = require('socks-proxy-agent')

let downloadPath = ''
module.exports = {
    async getPage(url) {
        let headers = {
            Referer: url,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"
        }
        const httpsAgent = new SocksProxyAgent(config.proxyURL);
        return {
            res: await axios({
                method: 'get',
                url: url,
                headers,
                httpsAgent
            }).catch((err)=>{
                console.error(err);
            })
        }
    },
    // 获取当前页面的相册集 list(name, url)
    getAlbumList(page) {
        let list = []
        const $ = cheerio.load(page.res.data)
        $('.list_box').each((index, item) => {
            var name = item.children[3].children[1].children[0].data;
            var url = item.attribs.href;
            let album = {
                name: name, // 相册名称
                url: config.originPath + url // 相册地址
            }
            list.push(album)
        })
        return list
    },
    // 获取图片页面中 图片地址
    getImageSrc(page) {
        let $ = cheerio.load(page.res.data)
        let list = []
        $(".imageblock img").each((index, item) => {
            let src = {
                src: item.attribs.src,
            }
            list.push(src)
        });
        return list
    },
    // 新建保存图片的文件夹
    mkdirSaveFolder() {
        if (!fs.existsSync(config.savePath)) {
            fs.mkdirSync(config.savePath)
            console.log(`主文件夹已生成：${config.savePath}`)
        } else {
            // console.log(`主文件夹已存在：${config.savePath}`)
        }
    },
    // 下载图片到本地
    async downloadImage(album, imageSrc, fileName) {
        if (fs.existsSync(fileName)) {
            // console.log(`文件已存在：${fileName}`)
        }
        else {
            let headers = {
                Referer: album.url,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"
            }
            const httpsAgent = new SocksProxyAgent(config.proxyURL);
            await axios({
                method: 'get',
                url: imageSrc,
                responseType: 'stream',
                headers,
                httpsAgent
            }).then(function (response) {
                response.data.pipe(fs.createWriteStream(fileName))
                console.log(`已保存: ${fileName}`)
            }).catch(function (err) {
                // console.error(err);
                console.error(`保存失败: ${fileName}`)
            })
        }
    }
}