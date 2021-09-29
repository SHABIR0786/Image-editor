import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faEraser, faDotCircle, faFont } from "@fortawesome/fontawesome-free-solid";
import Menu from "./Menu"
export default class Canvas extends Component {
    state = {
        tool: "pen",
        text:""
    }
    constructor(props) {
        super(props)
        this.state = {
            tool: "pen",
            text:"",
            beginX:0,
            beginY:0
        }
        this.changetool = this.changetool.bind(this);
        this.base64Image = this.base64Image.bind(this);
        this.fillText = this.fillText.bind(this);
    }
    base64Image(){
        const c = document.getElementById("myCanvas");
        const ctx = c.getContext("2d");
    }
    changetool(toolname) {
        this.setState({ tool: toolname })
    }
    fillText(text,x,y){
        const canvas = document.getElementById("myCanvas");
        const ctx = canvas.getContext("2d");
        ctx.font = "20px Comic Sans MS";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y);     
    }
    componentDidMount() {
        const Instance = this;
        // add an event listener for text append in the canvas ..
        document.getElementById("myCanvas").addEventListener('click',function(e){
            if(Instance.state.tool === "font"){
                if(document.getElementById('textinput')){
                    document.getElementById('textinput').remove();
                }else{
                var range = window.getSelection().getRangeAt(0);
              var input = document.createElement('input');
              input.setAttribute('id','textinput');
              input.style = "width:max-content;min-width:20px; border:1px solid black;position:absolute;left:"+e.pageX+"px;top:"+e.pageY+"px;";
              input.addEventListener('focusout',function(){
                const bounds = c.getBoundingClientRect();
                const x = e.pageX - bounds.left - scrollX;
                const y = e.pageY - bounds.top - scrollY;
                  Instance.fillText(input.value,x,y);
                  input.remove();
              });
              range.insertNode(input);
            }
        }
        });



        const c = document.getElementById("myCanvas");
        const ctx = c.getContext("2d");
        const r = 2; // draw radius
        ctx.lineWidth = r * 2;
        ctx.lineCap = "round";
        ctx.fillStyle = "black";
        var draw = false;
        var lineStart = true;
        var scrollX = 0;
        var scrollY = 0;
        var lastX, lastY;
        function yesDraw(e) { 
            draw = true;
            lineStart = true;
            const bounds = c.getBoundingClientRect();
            const x = e.pageX - bounds.left - scrollX;
            const y = e.pageY - bounds.top - scrollY;
            Instance.setState({beginX:x,beginY:y});        
        }
        function mouseMove(e) {
            const bounds = c.getBoundingClientRect();
            const x = e.pageX - bounds.left - scrollX;
            const y = e.pageY - bounds.top - scrollY;
            if (draw && x > -r && x < c.width + r && y > -r && y < c.height + r) {
                if (Instance.state.tool === "pen") {
                    pen();
                drawing(x, y);
                }else if(Instance.state.tool === "eraser"){
                    eraser(x,y);
                drawing(x, y);
                }else if(Instance.state.tool === "circle"){
                    // drawcircle(x,y);
                }
            }

        }
        function noDraw(e) { draw = false;
            const bounds = c.getBoundingClientRect();
            const x = e.pageX - bounds.left - scrollX;
            const y = e.pageY - bounds.top - scrollY;
            if(Instance.state.tool === "circle"){
                drawcircle(x,y);
            }
        }
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mousedown", yesDraw);
        document.addEventListener("mouseup", noDraw);
        function drawing(x, y) {
            if (lineStart) {
                lastX = x;
                lastY = y;
                lineStart = false;
            }
            ctx.beginPath();
            ctx.lineTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            lastX = x;
            lastY = y;
        }
       function drawcircle(x,y){
        if (lineStart) {
            lastX = x;
            lastY = y;
            lineStart = false;
        }
        ctx.beginPath();
        var radius = 0;
        if(lastX > Instance.state.beginX){
            radius = (lastX - Instance.state.beginX)/2;
        }else{
            radius = (Instance.state.beginX - lastX)/2;
        }

        ctx.arc(lastX - radius, lastY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        lastX = x;
        lastY = y;
       }
        function eraser() {
            ctx.globalCompositeOperation = "destination-out";  
            ctx.strokeStyle = "rgba(255,255,255,1)"; 
        }
        function pen() {
            ctx.globalCompositeOperation = "source-over";  
            ctx.strokeStyle = "black"; 
        }
    }
    render() {
        return (
            <div>
                <canvas id="myCanvas" height="400" max-width="1000">Your browser does not support canvas.</canvas>
                <div className="tools">
                    <span onClick={() => this.changetool('pen')} className={this.state.tool === "pen" ? "active" : "null"}><FontAwesomeIcon icon={faPencilAlt} /></span>
                    <span onClick={() => this.changetool('eraser')} className={this.state.tool === "eraser" ? "active" : "null"}><FontAwesomeIcon icon={faEraser} /></span>
                    <span onClick={() => this.changetool('circle')} className={this.state.tool === "circle" ? "active" : "null"}><FontAwesomeIcon icon={faDotCircle} /></span>
                    <span onClick={() => this.changetool('font')} className={this.state.tool === "font" ? "active" : "null"}><FontAwesomeIcon icon={faFont} /></span>
                </div>
               <Menu style={{'float':'right'}}></Menu>
            </div>
        );
    }
}