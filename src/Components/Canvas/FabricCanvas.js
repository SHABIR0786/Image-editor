import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faEraser, faDotCircle, faFont, faPlus, faAlignLeft, faArrowLeft, faArrowRight, faTrashAlt } from "@fortawesome/fontawesome-free-solid";
import { fabric } from 'fabric';
import Menu from "./Menu"
import { Button, TextField } from "@mui/material";
import { faArrowsAlt, faRemoveFormat } from "@fortawesome/free-solid-svg-icons";
export default class Canvas extends Component {
    state = {
        tool: null,
        text: "",
        canvas: null,
        EraserBrush: null,
        slides:[],
        currentSlide:{},
        currentIndex:0
    }
    constructor(props) {
        super(props)
        this.state = {
            tool: null,
            text: "",
            canvas: null,
            EraserBrush: null,
            slides:[],
            currentSlide:{},
            currentIndex:0
        }
        this.addCircle = this.addCircle.bind(this);
        this.addPencil = this.addPencil.bind(this);
        this.addEraser = this.addEraser.bind(this);
        this.addText = this.addText.bind(this);
        this.saveText = this.saveText.bind(this);
        this.TextChanged = this.TextChanged.bind(this);
        this.addMove = this.addMove.bind(this);
        this.saveSlide = this.saveSlide.bind(this);
        this.addNewSlide = this.addNewSlide.bind(this);
        this.getPreviousSlide = this.getPreviousSlide.bind(this);
        this.getNextSlide = this.getNextSlide.bind(this);
        this.deleteCurrentSlide = this.deleteCurrentSlide.bind(this);
    }
    async deleteCurrentSlide(){
        if(this.state.slides.length > 0){
            var slides = this.state.slides;
            slides.splice(this.state.currentIndex,1);
        await this.setState({slides:slides});
        await this.setState({currentIndex:this.state.currentIndex-1});
        await this.state.canvas.clear();
        await this.state.canvas.loadFromJSON(this.state.slides[this.state.currentIndex]);
        }else{
        await this.state.canvas.clear();
        }
    }

    async getNextSlide(){
        if((this.state.currentIndex+1) < this.state.slides.length){
           await this.saveSlide();
           await this.setState({currentIndex:this.state.currentIndex+1});
           await this.setState({currentSlide:this.state.slides[this.state.currentIndex]});
           await this.state.canvas.clear();
           await this.state.canvas.loadFromJSON(this.state.slides[this.state.currentIndex]);
           await this.saveSlide();
        }
    }
   async getPreviousSlide() {
        if(this.state.currentIndex > 0){
            await this.saveSlide();
            await this.setState({currentIndex:this.state.currentIndex - 1});
            await this.state.canvas.clear();
            await this.state.canvas.loadFromJSON(this.state.slides[this.state.currentIndex]);
            await this.saveSlide();
        }
    }

    async saveSlide() {
        this.setState({currentSlide:this.state.canvas.toJSON()});
        if(this.state.slides.length > 0) {
            const myNewArray = Object.assign([...this.state.slides], {
                [this.state.currentIndex]: this.state.canvas.toJSON()
            });
            await this.setState({slides : myNewArray });
        //   await this.state.slides[this.state.currentIndex] = this.state.canvas.toJSON();
        } else {
           await this.state.slides.push(this.state.canvas.toJSON());
        }
    }
  async addNewSlide(){
       await this.saveSlide();
       await this.setState({currentIndex:this.state.slides.length});
       await this.state.canvas.clear();
       await this.state.slides.push(this.state.canvas.toJSON());
       await this.saveSlide();
    }
    addMove() {
        this.setState({ tool: 'move' });
        this.state.canvas.isDrawingMode = false;
    }
    addText() {
        this.setState({ tool: 'font' });
    }
    saveText() {
        this.state.canvas.add(new fabric.Text(this.state.text, {
            fontFamily: 'Delicious_500',
            left: 100,
            top: 100
        }));
        this.setState({ text: "" });
    }
    TextChanged(e) {
        this.setState({ text: e.target.value });
    }
    addEraser() {
        this.setState({ tool: 'eraser' });
        const eraserBrush = new this.state.EraserBrush(this.state.canvas);
        eraserBrush.width = 10;
        eraserBrush.color = "#ffffff";
        this.state.canvas.freeDrawingBrush = eraserBrush;
        this.state.canvas.isDrawingMode = true;
    }
    addCircle() {
        this.setState({ tool: 'move' });
        this.state.canvas.isDrawingMode = false;
        this.state.canvas.add(new fabric.Circle({
            radius: 100,
            fill: '',
            stroke: 'black',
            strokeWidth: 3,
            originX: 'center',
            originY: 'center',
            top: 200,
            left: 500
        }));
    }
    addPencil() {
        var canvas = this.state.canvas;
        this.setState({ tool: 'pen' });
        canvas.selection = false;/* w w  w.d  em  o2 s.c  o  m*/
        canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
        canvas.freeDrawingBrush.width = parseInt(9, 6) || 1;
        //Event listener
        canvas.on('path:created', function (path) {
            canvas.sendBackwards(path.path); //Move the drawn path backwards
        });
        //Make canvas drawable
        canvas.freeDrawingBrush.color = 'black';
        canvas.isDrawingMode = true;
    }
    componentDidMount() {
        const Instance = this;
        this.setState({ canvas: new fabric.Canvas('myCanvas') },()=>{
            this.saveSlide();
        });
        /*
  * Note: Might not work with versions other than 3.1.0
  *
  * Made it so that the bound is calculated on the original only
  */
        const ErasedGroup = fabric.util.createClass(fabric.Group, {
            original: null,
            erasedPath: null,
            initialize: function (original, erasedPath, options, isAlreadyGrouped) {
                this.original = original;
                this.erasedPath = erasedPath;
                this.callSuper('initialize', [this.original, this.erasedPath], options, isAlreadyGrouped);
            },

            _calcBounds: function (onlyWidthHeight) {
                const aX = [],
                    aY = [],
                    props = ['tr', 'br', 'bl', 'tl'],
                    jLen = props.length,
                    ignoreZoom = true;
                var prop = null;
                let o = this.original;
                o.setCoords(ignoreZoom);
                for (let j = 0; j < jLen; j++) {
                    prop = props[j];
                    aX.push(o.oCoords[prop].x);
                    aY.push(o.oCoords[prop].y);
                }

                this._getBounds(aX, aY, onlyWidthHeight);
            },
        });

        /*
         * Note1: Might not work with versions other than 3.1.0
         * 
         * Made it so that the path will be 'merged' with other objects 
         *  into a customized group and has a 'destination-out' composition
         */
        const EraserBrush = fabric.util.createClass(fabric.PencilBrush, {

            /**
             * On mouseup after drawing the path on contextTop canvas
             * we use the points captured to create an new fabric path object
             * and add it to the fabric canvas.
             */
            _finalizeAndAddPath: function () {
                console.log(Instance.state);
                var ctx = Instance.state.canvas.contextTop;
                ctx.closePath();
                if (this.decimate) {
                    this._points = this.decimatePoints(this._points, this.decimate);
                }
                var pathData = this.convertPointsToSVGPath(this._points).join('');
                if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
                    // do not create 0 width/height paths, as they are
                    // rendered inconsistently across browsers
                    // Firefox 4, for example, renders a dot,
                    // whereas Chrome 10 renders nothing
                    Instance.state.canvas.requestRenderAll();
                    return;
                }

                // use globalCompositeOperation to 'fake' eraser
                var path = this.createPath(pathData);
                path.globalCompositeOperation = 'destination-out';
                path.selectable = false;
                path.evented = false;
                path.absolutePositioned = true;

                // grab all the objects that intersects with the path
                const objects = Instance.state.canvas.getObjects().filter((obj) => {
                    // if (obj instanceof fabric.Textbox) return false;
                    // if (obj instanceof fabric.IText) return false;
                    if (!obj.intersectsWithObject(path)) return false;
                    return true;
                });

                if (objects.length > 0) {

                    // merge those objects into a group
                    const mergedGroup = new fabric.Group(objects);

                    // This will perform the actual 'erasing' 
                    // NOTE: you can do this for each object, instead of doing it with a merged group
                    // however, there will be a visible lag when there's many objects affected by this
                    const newPath = new ErasedGroup(mergedGroup, path);

                    const left = newPath.left;
                    const top = newPath.top;

                    // convert it into a dataURL, then back to a fabric image
                    const newData = newPath.toDataURL({
                        withoutTransform: true
                    });
                    fabric.Image.fromURL(newData, (fabricImage) => {
                        fabricImage.set({
                            left: left,
                            top: top,
                        });

                        // remove the old objects then add the new image
                        Instance.state.canvas.remove(...objects);
                        Instance.state.canvas.add(fabricImage);
                    });
                }

                Instance.state.canvas.clearContext(Instance.state.canvas.contextTop);
                Instance.state.canvas.renderAll();
                //   Instance.state.canvas._resetShadow();
            },
        });
        this.setState({ EraserBrush: EraserBrush });
        // setInterval(function(){
        //   Instance.saveSlide();
        // },2000);
    }

    render() {
        return (
            <div className="">
                <canvas id="myCanvas" height="400" width="1000">Your browser does not support canvas.</canvas>
                <div style={{maxWidth:'1000px',margin:'auto'}}>
                <div className="tools">
                    <span onClick={this.addMove} className={this.state.tool === "move" ? "active" : "null"}><FontAwesomeIcon icon={faArrowsAlt} /></span>
                    <span onClick={this.addPencil} className={this.state.tool === "pen" ? "active" : "null"}><FontAwesomeIcon icon={faPencilAlt} /></span>
                    <span onClick={this.addEraser} className={this.state.tool === "eraser" ? "active" : "null"}><FontAwesomeIcon icon={faEraser} /></span>
                    <span onClick={this.addCircle} className={this.state.tool === "circle" ? "active" : "null"}><FontAwesomeIcon icon={faDotCircle} /></span>
                    <span onClick={this.addText} className={this.state.tool === "font" ? "active" : "null"}><FontAwesomeIcon icon={faFont} /></span>
                    {this.state.tool === "font" ? <div><TextField id="standard-basic" value={this.state.text} onChange={this.TextChanged} label="Enter Text" variant="standard" />
                    <Button variant="contained" onClick={this.saveText}>Save</Button>
                </div> : null}
                </div>
                <div className="navigationtools">
                <span onClick={this.addNewSlide} className={this.state.tool === "font" ? "active" : "null"}><FontAwesomeIcon icon={faPlus} /></span>
                <span onClick={this.getPreviousSlide} className={this.state.tool === "font" ? "active" : "null"}><FontAwesomeIcon icon={faArrowLeft} /></span>
                <span onClick={this.addText} className={this.state.tool === "font" ? "active" : "null"}>{this.state.currentIndex+1 }/{this.state.slides.length}</span>
                <span onClick={this.getNextSlide} className={this.state.tool === "font" ? "active" : "null"}><FontAwesomeIcon icon={faArrowRight} /></span>
                <span onClick={this.deleteCurrentSlide} className={this.state.tool === "font" ? "active" : "null"}><FontAwesomeIcon icon={faTrashAlt} /></span>
                </div>
                <Menu canvas={this.state.canvas} style={{ 'float': 'right' }}></Menu>
                </div>
            </div>
        );
    }
}