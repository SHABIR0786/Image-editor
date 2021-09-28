import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { Divider } from '@mui/material';

export default function FadeMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
 function exportSVG(){
    handleClose();
    var svgData = props.canvas.toSVG();
var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
var svgUrl = URL.createObjectURL(svgBlob);
var downloadLink = document.createElement("a");
downloadLink.href = svgUrl;
downloadLink.download = "newesttree.svg";
document.body.appendChild(downloadLink);
downloadLink.click();
document.body.removeChild(downloadLink);
  } 
  function exportPNG(){
    const dataURL = props.canvas.toDataURL({
        width: props.canvas.width,
        height: props.canvas.height,
        left: 0,
        top: 0,
        format: 'png',
   });
   const link = document.createElement('a');
   link.download = 'image.png';
   link.href = dataURL;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
  }
  function loadJSON(){
    handleClose();
    var input = document.createElement('input');
    input.type = "file";
    input.id = "inputfile";
    input.accept = ".json";
    input.style = "display:none;";
    document.body.append(input);
    document.getElementById('inputfile')
    .addEventListener('change', function() {
    var fr=new FileReader();
    fr.onload=function(){
        props.canvas.loadFromJSON(JSON.parse(fr.result), function() {
            props.canvas.renderAll();
        });
    }
    fr.readAsText(this.files[0]);
    });
input.click();
input.remove();
  }
  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  function exportJSON() {
      handleClose();  
      console.log(props.canvas.toJSON());
      download("hello.json",JSON.stringify(props.canvas.toJSON()));
  }

  return (
    <div>
      <Button
      style={{float:"right"}}
        id="fade-button"
        aria-controls="fade-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        Menu
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={loadJSON}>Load from JSON</MenuItem>
        <MenuItem onClick={exportJSON}>Save as JSON</MenuItem>
        <Divider></Divider>
        <MenuItem onClick={exportSVG}>Export as SVG</MenuItem>
        <MenuItem onClick={exportPNG}>Export as PNG</MenuItem>
      </Menu>
    </div>
  );
}
