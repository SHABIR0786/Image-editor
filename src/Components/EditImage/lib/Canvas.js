import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    Fragment
  } from 'react'
  import ReactLoading from 'react-loading';
  import { useOpenCv } from 'opencv-react'
  import T from 'prop-types'
  import { calcDims, readFile } from './utils'
  import CropPoints from './CropPoints'
  import { applyFilter, transform, EnhanceImage } from './imgManipulation'
  import CropPointsDelimiters from './CropPointsDelimiters'
  const buildImgContainerStyle = (previewDims) => ({
    width: previewDims.width,
    height: previewDims.height
  })
  
  const imageDimensions = { width: 0, height: 0 }
  let imageResizeRatio
  
  const Canvas = ({
    image,
    onDragStop,
    onChange,
    cropperRef,
    pointSize = 10,
    lineWidth,
    pointBgColor,
    pointBorder,
    lineColor,
    maxWidth,
    maxHeight
  }) => {
    const { loaded: cvLoaded, cv } = useOpenCv()
    const canvasRef = useRef()
    const previewCanvasRef = useRef()
    const magnifierCanvasRef = useRef()
    const [previewDims, setPreviewDims] = useState()
    const [cropPoints, setCropPoints] = useState()
    const [rotation, setRotation] = useState(0)
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState('crop')
    
    useImperativeHandle(cropperRef, () => ({
      backToCrop: () => {
        setMode('crop')
      },
      resetImage: async () => {
        const src = await readFile(image)
        await createCanvas(src)
        showPreview()
        detectContours()
        setLoading(false)
      },

      enhanceImage: async () => {
       await EnhanceImage(cv, canvasRef.current)
      showPreview()
      },
      rotateLeft:async () => {
        let newRotation = rotation - 90;
        if (Math.abs(newRotation) === 360) {
          newRotation = 0;
        }
        setRotation(newRotation);
        var degrees = newRotation;
        await rotateCanvas(image,degrees)
        showPreview()
        detectContours()
        setLoading(false)
      },
      rotateRight: async () => {
        let newRotation = rotation + 90;
        if (Math.abs(newRotation) === 360) {
          newRotation = 0;
        }
        setRotation(newRotation);
        var degrees = newRotation;
        await rotateCanvas(image,degrees)
        showPreview()
        detectContours()
        setLoading(false)
      },

      done: async (opts = {}) => {
        return new Promise((resolve) => {
          setLoading(true)
          transform(
            cv,
            canvasRef.current,
            cropPoints,
            imageResizeRatio,
            setPreviewPaneDimensions
          )
          // applyFilter(cv, canvasRef.current, opts.filterCvParams)
          if (opts.preview) {
            setMode('preview')
          }
          canvasRef.current.toBlob((blob) => {
            blob.name = image.name
            resolve(blob)
            setLoading(false)
          }, image.type)
        })
      }
    }))
  
    useEffect(() => {
      if (mode === 'preview') {
        showPreview()
      }
    }, [mode])
  
    const setPreviewPaneDimensions = () => {
      // set preview pane dimensions
      const newPreviewDims = calcDims(
        canvasRef.current.width,
        canvasRef.current.height,
        maxWidth,
        maxHeight
      )
      setPreviewDims(newPreviewDims)
      previewCanvasRef.current.width = newPreviewDims.width
      previewCanvasRef.current.height = newPreviewDims.height
      imageResizeRatio = newPreviewDims.width / canvasRef.current.width
    }
  
    const createCanvas = (src) => {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img')
        img.onload = async () => {
          // set edited image canvas and dimensions
          canvasRef.current = document.createElement('canvas')
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          const ctx = canvasRef.current.getContext('2d')
          ctx.drawImage(img, 0, 0)
          imageDimensions.width = canvasRef.current.width
          imageDimensions.height = canvasRef.current.height
          setPreviewPaneDimensions()
          resolve()
        }
        img.src = src
      })
    }
    const rotateCanvas = (src,degrees) => {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img')
        img.onload = async () => {
          // set edited image canvas and dimensions
          canvasRef.current = document.createElement('canvas')
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          const ctx = canvasRef.current.getContext('2d')
          var newSize = {width: canvasRef.current.width, height: canvasRef.current.height};
          if (degrees === 0) {
            ctx.drawImage(img, 0, 0, newSize.width, newSize.height)
        } 
        else {
          ctx.translate(canvasRef.current.width / 2, canvasRef.current.height / 2)
          ctx.rotate(degrees * Math.PI / 180)
            if (Math.abs(degrees) === 180) {
              ctx.drawImage(img, -newSize.width / 2, -newSize.height / 2, newSize.width, newSize.height)
            }
            else { // 90 or 270 degrees (values for width and height are swapped for these rotation positions)
              ctx.drawImage(img, -newSize.height / 2, -newSize.width / 2, newSize.height, newSize.width)
            }
        }
          imageDimensions.width = canvasRef.current.width
          imageDimensions.height = canvasRef.current.height
          setPreviewPaneDimensions()
          resolve()
        }
        img.src = src
      });
    }
  
    const showPreview = (image) => {
      const src = image || cv.imread(canvasRef.current)
      const dst = new cv.Mat()
      const dsize = new cv.Size(0, 0)
      cv.resize(
        src,
        dst,
        dsize,
        imageResizeRatio,
        imageResizeRatio,
        cv.INTER_AREA
      )
      cv.imshow(previewCanvasRef.current, dst)
      src.delete()
      dst.delete()
    }
    const detectContours = () => {
      let foundContour = null;
      let src = cv.imread(previewCanvasRef.current);
      let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
      let finaldst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
      let ksize = new cv.Size(5, 5);
      cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
      cv.Canny(dst, dst, 100, 200, 3, false); // You can try more different parameters
      cv.threshold(dst, dst, 100, 200,cv.THRESH_BINARY);
      let MN = cv.Mat.ones(5, 5, cv.CV_8U);
      let anchor = new cv.Point(-1, -1);
      // You can try more different parameters
      cv.dilate(dst, dst, MN, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      // let hull = new cv.MatVector();
      cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
      //Get area for all contours so we can find the biggest
      let sortableContours = [];
      for (let i = 0; i < contours.size(); i++) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt, false);
        let perim = cv.arcLength(cnt, false);
        sortableContours.push({ areaSize: area, perimiterSize: perim, contour: cnt });
      }
      //Sort 'em
      sortableContours = sortableContours.sort((item1, item2) => { return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0; }).slice(0, 5);
  
      //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
      let approx = new cv.Mat();
      cv.approxPolyDP(sortableContours[0].contour, approx, .05 * sortableContours[0].perimiterSize, true);
      if (approx.rows == 4) {
        foundContour = approx;
      //Find the corners
      //foundCountour has 2 channels (seemingly x/y), has a depth of 4, and a type of 12.  Seems to show it's a CV_32S "type", so the valid data is in data32S??
      let corner1 = new cv.Point(foundContour.data32S[0], foundContour.data32S[1]);
      let corner2 = new cv.Point(foundContour.data32S[2], foundContour.data32S[3]);
      let corner3 = new cv.Point(foundContour.data32S[4], foundContour.data32S[5]);
      let corner4 = new cv.Point(foundContour.data32S[6], foundContour.data32S[7]);
      //Order the corners
      let cornerArray = [{ corner: corner1 }, { corner: corner2 }, { corner: corner3 }, { corner: corner4 }];
      //Sort by Y position (to get top-down)
      cornerArray.sort((item1, item2) => { return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0; }).slice(0, 5);

      //Determine left/right based on x position of top and bottom 2
      let tl = cornerArray[0].corner.x < cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
      let tr = cornerArray[0].corner.x > cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
      let bl = cornerArray[2].corner.x < cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
      let br = cornerArray[2].corner.x > cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
      const contourCoordinates = {
        'left-top': { x: tl.corner.x, y: tl.corner.y },
        'right-top': { x: tr.corner.x, y: tr.corner.y },
        'right-bottom': {
          x: br.corner.x,
          y: br.corner.y
        },
        'left-bottom': { x: bl.corner.x, y: bl.corner.y }
      }
      setCropPoints(contourCoordinates)
      }
      else {
        const rect = cv.boundingRect(dst)
        dst.delete()
        hierarchy.delete()
        contours.delete()
  
        // transform the rectangle into a set of points
        Object.keys(rect).forEach((key) => {
          rect[key] = rect[key] * imageResizeRatio
        })
    
        const contourCoordinates = {
          'left-top': { x: rect.x, y: rect.y },
          'right-top': { x: rect.x + rect.width, y: rect.y },
          'right-bottom': {
            x: rect.x + rect.width,
            y: rect.y + rect.height
          },
          'left-bottom': { x: rect.x, y: rect.y + rect.height }
        }
      setCropPoints(contourCoordinates)
      }
  
    }
  
    const clearMagnifier = () => {
      const magnCtx = magnifierCanvasRef.current.getContext('2d')
      magnCtx.clearRect(
        0,
        0,
        magnifierCanvasRef.current.width,
        magnifierCanvasRef.current.height
      )
    }
  
    useEffect(() => {
      if (onChange) {
        onChange({ ...cropPoints, loading })
      }
    }, [cropPoints, loading])
  
    useEffect(() => {
      const bootstrap = async () => {
        const src = await readFile(image)
        await createCanvas(src)
        showPreview()
        detectContours()
        setLoading(false)
      }
      
      if (image && previewCanvasRef.current && cvLoaded && mode === 'crop') {
        bootstrap()
      } else {
        setLoading(true)
      }
    }, [image, previewCanvasRef.current, cvLoaded, mode])
  
    const onDrag = useCallback((position, area) => {
      const { x, y } = position
  
      const magnCtx = magnifierCanvasRef.current.getContext('2d')
      clearMagnifier()
  
      // TODO we should make those 5, 10 and 20 values proportionate
      // to the point size
      magnCtx.drawImage(
        previewCanvasRef.current,
        x - (pointSize - 10),
        y - (pointSize - 10),
        pointSize + 5,
        pointSize + 5,
        x + 10,
        y - 90,
        pointSize + 20,
        pointSize + 20
      )
  
      setCropPoints((cPs) => ({ ...cPs, [area]: { x, y } }))
    }, [])
  
    const onStop = useCallback((position, area, cropPoints) => {
      const { x, y } = position
      clearMagnifier()
      setCropPoints((cPs) => ({ ...cPs, [area]: { x, y } }))
      if (onDragStop) {
        onDragStop({ ...cropPoints, [area]: { x, y } })
      }
    }, [])
  
    return (
      <div
        style={{
          margin:'auto',
          position: 'relative',
          ...(previewDims && buildImgContainerStyle(previewDims))
        }}>
        {previewDims && mode === 'crop' && cropPoints && (
          <Fragment>
            <CropPoints
              pointSize={pointSize}
              pointBgColor={pointBgColor}
              pointBorder={pointBorder}
              cropPoints={cropPoints}
              previewDims={previewDims}
              onDrag={onDrag}
              onStop={onStop}
              bounds={{
                left: previewCanvasRef?.current?.offsetLeft - pointSize / 2,
                top: previewCanvasRef?.current?.offsetTop - pointSize / 2,
                right:
                  previewCanvasRef?.current?.offsetLeft -
                  pointSize / 2 +
                  previewCanvasRef?.current?.offsetWidth,
                bottom:
                  previewCanvasRef?.current?.offsetTop -
                  pointSize / 2 +
                  previewCanvasRef?.current?.offsetHeight
              }}
            />
            <CropPointsDelimiters
              previewDims={previewDims}
              cropPoints={cropPoints}
              lineWidth={lineWidth}
              lineColor={lineColor}
              pointSize={pointSize}
            />
            <canvas
              style={{
                position: 'absolute',
                zIndex: 5,
                pointerEvents: 'none'
              }}
              width={previewDims.width}
              height={previewDims.height}
              ref={magnifierCanvasRef}
            />
          </Fragment>
        )}
        <canvas
          style={{ zIndex: 5, pointerEvents: 'none'}}
          ref={previewCanvasRef}
        />
        {loading?<ReactLoading type='spin' color='blue' id="loader" height={200} width={100} />:null}
      </div>
    )
  }

  export default Canvas

  Canvas.propTypes = {
    image: T.object.isRequired,
    onDragStop: T.func,
    onChange: T.func,
    cropperRef: T.shape({
      current: T.shape({
        done: T.func.isRequired,
        backToCrop: T.func.isRequired,
        rotateLeft: T.func.isRequired,
        rotateRight: T.func.isRequired,
        enhanceImage: T.func.isRequired,
        resetImage:T.func.isRequired
      })
    }),
    pointSize: T.number,
    lineWidth: T.number,
    pointBgColor: T.string,
    pointBorder: T.string,
    lineColor: T.string
  }