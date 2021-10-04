let imgPreview = document.getElementById('imgPreview')
let canvas = document.getElementById('canvas')
let statusMessage = document.getElementById('statusMessage')
let img = new Image
let maxSize = { width: 800, height: 600 }
let rotationDegrees = 0

// canvas.toBlob Polyfill from https://gist.github.com/salzhrani/02a6e807f24785a4d34b
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob',
        {
            value: function (callback, type, quality) {
                var bin = atob(this.toDataURL(type, quality).split(',')[1]),
                    len = bin.length,
                    len32 = len >> 2,
                    a8 = new Uint8Array(len),
                    a32 = new Uint32Array(a8.buffer, 0, len32);

                for (var i = 0, j = 0; i < len32; i++) {
                    a32[i] = bin.charCodeAt(j++) |
                        bin.charCodeAt(j++) << 8 |
                        bin.charCodeAt(j++) << 16 |
                        bin.charCodeAt(j++) << 24;
                }

                var tailLength = len & 3;

                while (tailLength--) {
                    a8[j] = bin.charCodeAt(j++);
                }

                callback(new Blob([a8], { 'type': type || 'image/png' }));
            }
        });
}

document.getElementById('fileInput').addEventListener('change', function (e) {
    if (!e.target.files.length) { return }
    let file = e.target.files[0]
    if (isValidMIME(file, ['image/bmp', 'image/jpeg', 'image/png'])) {
        img.src = window.URL.createObjectURL(file)
        console.log(img.src);
    }
    else {
        alert('Invalid file type. The image file must be one of the following:  .jpg  .jpeg  .png  .bmp')
    }
})

let isValidMIME = function (file, MIMEtypes) {
    for (let i = 0; i < MIMEtypes.length; i++) {
        if (MIMEtypes[i] === file.type) {
            return true
        }
    }
    return false
}

img.addEventListener('load', function () {
    rotationDegrees = 0
    removeStatusMessage()
    drawOptimizedImage(canvas, img, maxSize)
    updateImgPreview(canvas, imgPreview)
})

let removeStatusMessage = function () {
    statusMessage.textContent = ''
    statusMessage.style.display = 'none'
}

let drawOptimizedImage = function (canvas, image, maxSize, rotationDirection) {
    let degrees = updateRotationDegrees(rotationDirection)
    let newSize = determineSize(image.width, image.height, maxSize.width, maxSize.height, degrees)

    canvas.width = newSize.width
    canvas.height = newSize.height

    let ctx = canvas.getContext('2d')
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (degrees === 0) {
        ctx.drawImage(image, 0, 0, newSize.width, newSize.height)
    } 
    else {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(degrees * Math.PI / 180)

        if (Math.abs(degrees) === 180) {
            ctx.drawImage(image, -newSize.width / 2, -newSize.height / 2, newSize.width, newSize.height)
        }
        else { // 90 or 270 degrees (values for width and height are swapped for these rotation positions)
            ctx.drawImage(image, -newSize.height / 2, -newSize.width / 2, newSize.height, newSize.width)
        }
    }

    ctx.restore()
}

let updateRotationDegrees = function (rotationDirection) {
    if (rotationDirection === 'clockwise') { rotationDegrees += 90 }
    else if (rotationDirection === 'anticlockwise') { rotationDegrees -= 90 }
    if (Math.abs(rotationDegrees) === 360) { rotationDegrees = 0 }
    return rotationDegrees
}

let determineSize = function (width, height, maxW, maxH, degrees) {
    let w, h;
    degrees = Math.abs(degrees)
    if (degrees === 90 || degrees === 270) { // values for width and height are swapped for these rotation positions
        w = height
        h = width
    }
    else {
        w = width
        h = height
    }
    if (w > h) {
        if (w > maxW) {
            h = h * maxW / w
            w = maxW
        }
    }
    else {
        if (h > maxH) {
            w = w * maxH / h
            h = maxH
        }
    }
    return { width: w, height: h }
}

let updateImgPreview = function (canvas, div) {
    if (canvas.width < div.clientWidth && canvas.height < div.clientHeight) {
        div.style.backgroundSize = 'auto'
    }
    else {
        div.style.backgroundSize = 'contain'
    }
    div.style.backgroundImage = 'url(' + canvas.toDataURL() + ')'
}

document.getElementById('clockwiseBtn').addEventListener('click', function () {
    removeStatusMessage()
    drawOptimizedImage(canvas, img, maxSize, 'clockwise')
    updateImgPreview(canvas, imgPreview)
})

document.getElementById('anticlockwiseBtn').addEventListener('click', function () {
    removeStatusMessage()
    drawOptimizedImage(canvas, img, maxSize, 'anticlockwise')
    updateImgPreview(canvas, imgPreview)
})

document.getElementById('uploadBtn').addEventListener('click', function () {
    let fileInput = document.getElementById('fileInput')
    if (!fileInput.files.length) { alert('Please choose a file first'); return; }

    let formData = new FormData()
    formData.append('fileName', 'yourCustomFileNameHere')

    canvas.toBlob(function (blob) {
        formData.append('image', blob)
        let url = 'theURLtoSendTheFileTo'
        sendForm(url, formData, doAfterUploadSuccess)
    }, 'image/jpeg', 1.0)
})

let sendForm = function (url, formData, callback) {

    // Simulating upload. Use the commented code below for a real upload.
    statusMessage.style.display = 'block'
    statusMessage.textContent = 'Uploading, please wait...'
    setTimeout(callback, 2000)

    // let xhr = new XMLHttpRequest()
    // addUploadListeners(xhr)
    // xhr.open('POST', url, true)
    // xhr.onload = function () {
    //     if (xhr.status == 200) {
    //         if (callback) { callback(xhr) }
    //     }
    //     else if (xhr.status === 0) {
    //         alert('No response from server. Check network connection.')
    //     }
    //     else {
    //         alert('There was a problem uploading:  ' + xhr.statusText)
    //     }
    // }
    // statusMessage.style.display = 'block'
    // xhr.send(formData)
}

let addUploadListeners = function (xhr) {
    xhr.addEventListener('loadstart', function (e) { statusMessage.textContent = 'Uploading, please wait...' })
    xhr.addEventListener('abort', function (e) { statusMessage.textContent = 'Aborted upload' })
    xhr.addEventListener('error', function (e) { statusMessage.textContent = 'Error during upload' })
}

let doAfterUploadSuccess = function (xhr) {
    statusMessage.textContent = 'Success!'
}