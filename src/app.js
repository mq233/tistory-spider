const fs = require('fs'),
    config = require('./config'),
    method = require('./method')

let currentPageNum = 1
// 初始化方法
const start = () => {
    method.mkdirSaveFolder()
    main(currentPageNum)
}

// 主方法
const main = async pageNum => {
    console.log(`start ... 当前页码：${pageNum}`)
    // 根据页码获取页面对象
    let pageUrl = `${config.originPath}/category/PHOTO?page=${pageNum}`
    const page = await method.getPage(pageUrl)
    // 获取页面内的相册list
    let albumList = method.getAlbumList(page)
    downloadAlbumList(albumList)
}

// 下载本页面的所有相册
const downloadAlbumList = async (list) => {
    let index = 0
    for (let i = 0; i < list.length; i++) {
        // 下载相册
        await downloadAlbum(list[i])
        index++
    }
    // 判断本页相册是否下载完毕
    if (index === list.length) {
        console.log(`第${currentPageNum}页下载完成，共${index}个相册。========================== `)
        if (currentPageNum < config.maxPage) {
            // 进行下一页的相册爬取
            main(++currentPageNum)
        }
    }
}

// 下载相册
const downloadAlbum = async album => {
    // 过滤相册名称中不符合命名规则的部分字符
    album.name = album.name.replace(/[\[\]\/:"\*\|]/g, '')
    // 判断相册是否存在
    let folderPath = `${config.savePath}/${album.name}`
    if (fs.existsSync(folderPath)) {
        // console.log(`已存在：${album.name}`)
    } else {
        fs.mkdirSync(folderPath)
        console.log(`》》》 生成：${album.name}`)
    }
    // 获取相册所在的页面
    let albumPage = await method.getPage(album.url)
    // 获取相册中图片总数
    let imageSrc = method.getImageSrc(albumPage)
    for (let j = 1; j <= imageSrc.length; j++) {
        var filename = folderPath.replace(/\.(png|jpe?g|gif|svg)(\?.*)?$/g, '')
        // 获取图片所在页面
        await method.downloadImage(album, imageSrc[j-1].src, `${folderPath}/${j}.jpg`)
    }
}

module.exports = {
    start
}