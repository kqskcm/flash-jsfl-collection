﻿// JSFL
// 
// generates class vars to match elements on stage
// 
//
// by David Knape
// http://bumpslide.com/

// Author name to display in code
var author = "David Knape";




//-----------------------------
// GLOBALS
//-----------------------------

// The current Timeline
var timeline = fl.getDocumentDOM().getTimeline();

// output buffer
var output = ""; 

// classes to import
var imports = [];

// clips we've processed (in case they are on more than one frame)
var processedElements = [];

// shortcut to trace
trace = fl.outputPanel.trace;



//-----------------------------
// FUNCTIONS
//-----------------------------


// trace to output buffer
function dtrace( s ) {
	output+="\n"+s;
}

// add class name to imports list if it isn't already there
function addToImports( className ) {
    for (var i=0; i<imports.length; i++) if(imports[i] == className) return;
    imports.push( className );
}

// get classname for current timeline by looking for it in the library
// (not foolproof, looking for suggestions here)
function getTimelineClass() {
    var items = fl.getDocumentDOM().library.items;
    for (var n=0; n<items.length; n++) { 
        if(items[n].name.split('/').pop()==timeline.name) return items[n].linkageClassName;
    }
    return timeline.name;    
}

// Returns a "var" entry for a given timeline element
// example: "var instance_name : ClassName;"
function getVarForElement(el) {

    // check if we have already processed this element
    for(var i in processedElements) if(processedElements[i] == el.name) return "";
	processedElements.push( el.name );
    
	// local vars
	var propType=null;
	var classname = '';
	var output = "";
	
    switch( el.elementType ) 
    {
        case "instance": 
			// If class attached, import it and use the
			// base name, otherwise use the MovieClip class
            var classname = el.libraryItem.linkageClassName;
            if(classname!=null) {
                addToImports( classname );
                propType = ":" + classname.split('.').pop();
            } else {
                propType = ":MovieClip";
            }
            break;
			
		// TextFields are easy
        case "text": 
			propType = ":TextField"; 
			break;
			
		// Shapes don't apply, but grouped elements show up as shapes.
		// So, we should put out a warning when groups are found
        case "shape":
            if(el.isGroup) {
                // found a group of items, not supported
                return "\t// Warning: Grouped items found \n\t// (clips must be ungrouped to be identified this JSFL script)";
            }
            break;
    }
    if(propType) {
		var varname = el.name=="" ? "NO_INSTANCE_NAME" : el.name;
		return "\n\tpublic var "+varname + propType+";";                
	}
	return "";
}




// main subroutine
function main() {

	
	var l,f,e;        // iterators
	var elements;

    fl.outputPanel.clear();

	
	// print class header
    dtrace( "\n/**");
    dtrace( " * This class is a movie clip");
    dtrace( " * ");
    dtrace( " * This code was generated by a JSFL file.");
    dtrace( " * http://bumpslide.com/");
    dtrace( " * ");
    dtrace( " * @author "+author);
    dtrace( " */");
    dtrace( "\nclass "+getTimelineClass()+" extends MovieClip \n{");
    
    // print vars
    dtrace("\t// timeline clips\n\t//--------------------");
	
    // process all layers
    for(l=0; l<timeline.layers.length; l++) 
    {     
        // print layer name as comment to pretty up our vars
                       
        var varlines = "";
        // process all frames
        for(f=0; f<timeline.layers[l].frames.length; f++) 
        {        
            elements=timeline.layers[l].frames[f].elements;
            for(e=0; e<elements.length; e++) {
				varlines+=getVarForElement( elements[e] );
            }
        }
		
		// if layer had elements, output the var text with a
		// comment matching the layer name
		if(varlines!="") {
			dtrace( "\n\t// "+ timeline.layers[l].name + varlines );
		}
    }
	
    // end class
    dtrace( "}" );
    
	
	
	// OUTPUT...
    
    // print imports using regular trace
    for(var n=0; n<imports.length; n++) trace( "import "+imports[n] + ";");
    
	// trace buffered output
    trace( output );    
}




// run...
main();
