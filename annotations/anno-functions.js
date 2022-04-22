// ********************* //
// cg-app.js
// VERSION 4.X
// Functions for Capital Group Page Builder Engine
// ********************* //

//OUTPUT FOR CRASHES
console.log('anno functions 4/4');

//////
function receiveMessage(event) {
    // const url = 'https://htmlhost-prod-westus-az.smchost.io';

    if (event.origin) {
        if (event.origin.startsWith('https://h') || event.origin.startsWith('http://127.0.0.1') || event.origin === 'null' || event.origin.startsWith('file://capgr') || event.origin.startsWith('http://local')) {

            if (event.data === 'a') {
                toggleAnnotation();
            }

        } else {
            console.warn('recieved message, but bad URI')
        }
    }
}

// LISTEN FOR INCOMING MESSAGE
if (window.addEventListener) {
    // For standards-compliant web browsers
    window.addEventListener("message", receiveMessage, false);
}
else {
    window.attachEvent("onmessage", receiveMessage);
}

function toggleAnnotation() {
    const uiHidden =
        (document.querySelector('#annotation-ui-container') && document.querySelector('#annotation-ui-container').style.opacity === '0') ||
        (document.querySelector('#annotation-ui-container') && document.querySelector('#annotation-ui-container').style.right === '-45px');

    if (uiHidden) {
        openAnnotationUI();
    } else {
        closeAnnotationUI();
        if (window.fundPageOpened) {
            setTimeout(() => {
                clearAnnotation();
            }, 777);
        }
    }

}

// LISTENS FOR KEYBOARD INPUT
document.addEventListener('keydown', event => {
    // OPENS ANNOTAION PANEL ****************************
    if (event.key.toLowerCase() === 'a') {
        toggleAnnotation();
    }
});

// ****************************************************************************************************************************** //
// Annotation Logic
// ****************************************************************************************************************************** //
if (document.getElementById('c-annotation')) {
    var PAGEBODY = document.querySelector('body');
    var panelNotMoving = true;
    // open UI panel
    function openAnnotationUI() {
        if (panelNotMoving) {
            panelNotMoving = false;

            // UI element
            const annoui = document.querySelector('#annotation-ui-container');
            annoui.style.display = 'block';

            // ENABLE CANVAS LAYERS
            document.querySelector('#canvas-container').style.display = 'block';
            document.querySelector('#c-annotation').style.display = 'block';
            document.querySelector('#c-highlighter').style.display = 'block';

            // body unselectable
            PAGEBODY.style.userSelect = 'none';

            setTimeout(() => {

                // UI ELEMENT
                annoui.style.opacity = '1';

                // IF THE UI HASN'T BEEN MOVED BY THE USER WE MOVE IT
                if (annoui.style.right === '-45px') {
                    annoui.style.right = '0px';
                }

                annoui.style.boxShadow = '0px 0px 20px #00000021';

                // TURN ON CANVAS LAYER OPACITY
                document.querySelector('#c-annotation').style.opacity = '.8';
                document.querySelector('#c-highlighter').style.opacity = '.7';

                panelNotMoving = true;
            }, 20);
        }
    }

    var panelHeight = document.getElementById('annotation-ui-container').clientHeight;
    // console.log('what is panel height?', panelHeight)

    // close UI panel
    function closeAnnotationUI() {
        closeSwatches();
        if (panelNotMoving) {
            panelNotMoving = false;
            const annoui = document.querySelector('#annotation-ui-container');

            // IN CASE PANEL IS OFF THE SCREEN we will reposition it
            if (annoui.style.right.match(/[0-9]*/)[0] >= window.innerWidth + 1) {
                annoui.style.right = window.innerWidth - 60 + 'px';
            }

            // BRING PANEL BACK ON SCREEN IF IT'S POSITIONED OFF SCREEN
            if (annoui.style.top.match(/[0-9]*/)[0] >= window.innerHeight - panelHeight) {
                annoui.style.top = window.innerHeight - panelHeight + 'px';
            }

            // ELEMENT SLIDE OUT if it hasn't been repositioned by user
            if (annoui.style.right !== '0px') {
                // UI ELEMENT, FADE OUT
                annoui.style.opacity = '0';
            } else {
                annoui.style.right = '-45px';
            }
            annoui.style.boxShadow = '0px 0px 20px #00000000';

            // FADE OUT CANVASES
            document.querySelector('#c-annotation').style.opacity = '0';
            document.querySelector('#c-highlighter').style.opacity = '0';

            // body selectable
            PAGEBODY.style.userSelect = 'unset';
            setTimeout(() => {
                //TURN OFF ANNO UI AND CANVASES
                annoui.style.display = 'none';
                document.querySelector('#c-annotation').style.display = 'none';
                document.querySelector('#c-highlighter').style.display = 'none';
                document.querySelector('#canvas-container').style.display = 'none';

                panelNotMoving = true;
            }, 500);
        }
    }

    // open UI panel on click
    document.querySelector('.open-annotation-circle').addEventListener('click', () => {
        openAnnotationUI();
    });

    // close UI panel on click
    document.querySelector('#close-annotation-ui').addEventListener('click', () => {
        closeAnnotationUI();
    });

    //CONSTS FOR ANNOTATION
    var pagePath = 'path-' + window.location.href.match(/([^/]*)$/)[0];
    var isErasing = false;
    var isHighlighting = getIsHighlighting();
    var undoStack = [];
    var undoIndex = 0;
    var hUndoStack = [];
    var hUndoIndex = 0;
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var smPenSize = 10;
    var midPenSize = 15;
    var lgPenSize = 20;

    // SETUP UP CANVAS
    var canvasAnno = document.getElementById('c-annotation');
    canvasAnno.height = window.innerHeight - 0;
    canvasAnno.width = document.querySelector('body').offsetWidth;

    var markerTip = document.querySelector('#marker-tip');
    var markerBody = document.querySelector('#marker-body');
    var highlighterTip = document.querySelector('#highlighter-tip');
    var highlighterBody = document.querySelector('#highlighter-body');
    var eraserPath = document.querySelector('#eraser-path');

    function setIconTips() {
        const color = getPenColor();
        const rgbColors = color.replace('rgb(', '').replace(')', '').split(',');
        const paleColor = `rgba(${rgbColors[0]}, ${rgbColors[1]}, ${rgbColors[2]}, 0.3)`;

        if (!isErasing) {
            eraserPath.style.fill = 'white';

            if (isHighlighting) {
                highlighterTip.style.fill = color;
                // highlighterBody.style.fill = '#FBFDC3';
                highlighterBody.style.fill = paleColor;

                markerTip.style.fill = '#8d8d8d';
                markerBody.style.fill = 'white';
            } else {
                highlighterTip.style.fill = ' #8d8d8d';
                highlighterBody.style.fill = 'white';
                markerTip.style.fill = color;
                // markerBody.style.fill = '#9BD7FF';
                markerBody.style.fill = paleColor;
            }
        } else {
            highlighterTip.style.fill = ' #8d8d8d';
            highlighterBody.style.fill = 'white';
            markerTip.style.fill = '#8d8d8d';
            markerBody.style.fill = 'white';
            eraserPath.style.fill = '#FFC082';
        }
    }

    setIconTips();

    // document.querySelector('#c-annotation').style.top = -document.querySelector('.p-copy-top').offsetHeight + 'px';

    // SETUP UP HIGHLIGHTER-CANVAS
    var highlighter = document.getElementById('c-highlighter');
    highlighter.height = window.innerHeight - 0;
    highlighter.width = document.querySelector('body').offsetWidth;
    // document.querySelector('#c-highlighter').style.top = -document.querySelector('.p-copy-top').offsetHeight + 'px';

    // RESTORE PEN SIZE AND UI SIZE ON LOAD if available
    if (window.localStorage.getItem('penSize')) {
        setPen(getPenSize());
    }

    // RESTORE PEN COLOR IN UI
    document.querySelector('#pen-tip-color').style.fill = getPenColor();
    document.querySelectorAll('.anno-color-circle').forEach(el => {
        if (el.style.backgroundColor === getPenColor()) {
            el.classList.add('acc-active');
        }
    });

    // ACTIVATE MARKER UI OR HIGHTLIGHTER UI
    if (getIsHighlighting()) {
        document.querySelector('#anno-highlighter').style.opacity = 1;
    } else {
        document.querySelector('#anno-marker').style.opacity = 1;
    }

    // SET UP DRAWING FOR MOUSE INPUT
    canvasAnno.addEventListener('mousedown', handleMouseDown, false);
    canvasAnno.addEventListener('mouseup', handleMouseUp, false);
    canvasAnno.addEventListener('mousemove', handleMouseMove, false);

    //HANDLE MOUSE EVENTS FOR DRAWING
    // MOUSE DOWN
    function handleMouseDown(e) {
        closeSwatches();

        if (isHighlighting) {
            let ctx = highlighter.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = getPenColor();
            ctx.fillRect(e.offsetX, e.offsetY - 10, 25, getPenSize() === lgPenSize ? 40 : getPenSize() === midPenSize ? 32 : 24);
        } else {
            let ctx = canvasAnno.getContext('2d');

            if (isErasing) {
                const brushSize = getPenSize() === lgPenSize ? 50 : getPenSize() === midPenSize ? 30 : 20;
                ctx.lineCap = 'round';
                ctx.lineWidth = brushSize;
                ctx.globalCompositeOperation = 'destination-out';

                // ERASING PEN
                ctx.beginPath();
                ctx.moveTo(canvasAnno.X, canvasAnno.Y);
                ctx.arc(e.offsetX, e.offsetY, brushSize / 2, 0, 2 * Math.PI, false);
                ctx.fill();

                // ERASING HIGHLIGHT
                let cth = highlighter.getContext('2d');
                cth.lineCap = 'round';
                cth.lineWidth = 30;
                cth.globalCompositeOperation = 'destination-out';
                cth.beginPath();
                cth.moveTo(canvasAnno.X, canvasAnno.Y);
                cth.arc(e.offsetX, e.offsetY, brushSize / 2, 0, 2 * Math.PI, false);
                cth.fill();
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.beginPath();
                ctx.arc(e.offsetX, e.offsetY, getPenSize() / 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = getPenColor();
                ctx.fill();
            }
        }

        canvasAnno.down = true;
        canvasAnno.X = e.offsetX;
        canvasAnno.Y = e.offsetY;
    }

    // MOUSE UP
    function handleMouseUp() {
        canvasAnno.down = false;
        storePaths();
    }

    // MOUSE MOVE
    function handleMouseMove(e) {
        if (canvasAnno.down) {
            if (isHighlighting) {
                let ctx = highlighter.getContext('2d');
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = getPenColor();
                ctx.fillRect(e.offsetX, e.offsetY - 10, 28, getPenSize() === lgPenSize ? 40 : getPenSize() === midPenSize ? 32 : 24);
            } else {
                let ctx = canvasAnno.getContext('2d');
                ctx.lineCap = 'round';

                if (isErasing) {
                    const brushSize = getPenSize() === lgPenSize ? 50 : getPenSize() === midPenSize ? 30 : 20;
                    ctx.lineWidth = brushSize;
                    ctx.globalCompositeOperation = 'destination-out';

                    // ERASING PEN
                    ctx.beginPath();
                    ctx.moveTo(canvasAnno.X, canvasAnno.Y);
                    ctx.lineTo(e.offsetX, e.offsetY);
                    ctx.stroke();

                    // ERASING HIGHLIGHT
                    let cth = highlighter.getContext('2d');
                    cth.lineCap = 'round';
                    cth.lineWidth = brushSize;
                    cth.globalCompositeOperation = 'destination-out';
                    cth.beginPath();
                    cth.moveTo(canvasAnno.X, canvasAnno.Y);
                    cth.lineTo(e.offsetX, e.offsetY);
                    cth.stroke();
                } else {
                    ctx.lineWidth = getPenSize();
                    ctx.strokeStyle = getPenColor();
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.beginPath();
                    ctx.moveTo(canvasAnno.X, canvasAnno.Y);
                    ctx.lineTo(e.offsetX, e.offsetY);
                    ctx.stroke();
                }
            }
            canvasAnno.X = e.offsetX;
            canvasAnno.Y = e.offsetY;
        }
    }

    // HANDLE TOUCH EVENTS FOR IPAD
    canvasAnno.addEventListener('touchstart', handleStart, false);
    canvasAnno.addEventListener('touchend', handleEnd, false);
    canvasAnno.addEventListener('touchcancel', handleCancel, false);
    canvasAnno.addEventListener('touchmove', handleMove, false);

    var ongoingTouches = [];

    // POSITION OFFSET FOR HIGHLIGHTING
    function createOffset() {
        const penSize = getPenSize();

        if (penSize === lgPenSize) return lgPenSize;
        else if (penSize === midPenSize) return midPenSize;
        else return 12;
    }

    // TOUCH START IPAD
    function handleStart(e) {
        closeSwatches();

        e.preventDefault();

        var ctx = canvasAnno.getContext('2d');
        ctx.lineCap = 'round';
        var touchesID = e.changedTouches[0].identifier;

        var isStylus = e.changedTouches[0].touchType === 'stylus'; // or 'direct'
        if (isStylus) {
            console.log('apple pencil detected');
        } else {
            console.log('apple pencil NOT detected');
        }

        ongoingTouches.push({
            identifier: touchesID,
            pageX: e.layerX,
            pageY: e.layerY
        });

        if (isHighlighting) {
            ctx = highlighter.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = getPenColor();
            ctx.fillRect(
                e.layerX - 10,
                e.layerY - createOffset(),
                28,
                getPenSize() === lgPenSize ? 40 : getPenSize() === midPenSize ? 32 : 24
            );
        } else if (isErasing) {
            const brushSize = getPenSize() === lgPenSize ? 50 : getPenSize() === midPenSize ? 30 : 20;
            ctx.lineWidth = brushSize;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(e.layerX, e.layerY, brushSize / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = getPenColor();
            ctx.fill();

            var cth = canvasAnno.getContext('2d');
            cth.lineWidth = 30;
            cth.globalCompositeOperation = 'destination-out';
            cth.beginPath();
            cth.arc(e.layerX, e.layerY, brushSize / 2, 0, 2 * Math.PI, false);
            cth.fillStyle = getPenColor();
            cth.fill();
        } else {

            console.log('drawing')
            ctx.lineWidth = getPenSize();
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.arc(e.layerX, e.layerY, getPenSize() / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = getPenColor();
            ctx.fill();
        }
    }

    // TOUCH MOVE
    function handleMove(evt) {
        evt.preventDefault();

        var ctx = canvasAnno.getContext('2d');
        var touchesID = evt.changedTouches[0].identifier;

        var idx = ongoingTouchIndexById(touchesID);

        if (idx >= 0) {
            ctx.beginPath();

            if (isHighlighting) {
                ctx = highlighter.getContext('2d');
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = getPenColor();
                ctx.fillRect(
                    evt.layerX - 10,
                    evt.layerY - createOffset(),
                    25,
                    getPenSize() === lgPenSize ? 40 : getPenSize() === midPenSize ? 32 : 24
                );
            } else if (isErasing) {
                const brushSize = getPenSize() === lgPenSize ? 50 : getPenSize() === midPenSize ? 30 : 20;
                ctx.lineWidth = brushSize;
                ctx.globalCompositeOperation = 'destination-out';

                // ERASING PEN
                ctx.beginPath();
                ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                ctx.lineTo(evt.layerX, evt.layerY);
                ctx.stroke();

                // ERASING HIGHLIGHTER
                let cth = highlighter.getContext('2d');
                cth.lineCap = 'round';
                cth.lineWidth = brushSize;
                cth.globalCompositeOperation = 'destination-out';
                cth.beginPath();
                cth.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                cth.lineTo(evt.layerX, evt.layerY);
                cth.stroke();
            } else {
                console.log('drawing for real')
                ctx.lineWidth = getPenSize();
                ctx.strokeStyle = getPenColor();
                ctx.globalCompositeOperation = 'source-over';
                ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                ctx.lineTo(evt.layerX, evt.layerY);
                ctx.stroke();
            }

            // ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
            ongoingTouches.splice(idx, 1, {
                identifier: touchesID,
                pageX: evt.layerX,
                pageY: evt.layerY
            }); // swap in the new touch record
        } else {
            console.log("can't figure out which touch to continue");
        }
    }

    // TOUCH END
    function handleEnd(evt) {
        evt.preventDefault();
        var ctx = canvasAnno.getContext('2d');
        ctx.lineCap = 'round';

        var touchesID = evt.changedTouches[0].identifier;
        var idx = ongoingTouchIndexById(touchesID);

        if (idx >= 0) {
            if (isErasing) {
                ctx.lineWidth = 30;
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.lineWidth = getPenSize();
                ctx.fillStyle = getPenColor();
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(evt.layerX, evt.layerY);
            ongoingTouches.splice(idx, 1); // remove it; we're done

            storePaths();
        } else {
            console.log("can't figure out which touch to end");
        }
    }

    // TOUCH CANCEL
    function handleCancel(evt) {
        evt.preventDefault();
        var touches = evt.changedTouches;

        for (var i = 0; i < touches.length; i++) {
            var idx = ongoingTouchIndexById(touches[i].identifier);
            ongoingTouches.splice(idx, 1); // remove it; we're done
        }
        storePaths();
    }

    // HELPER FOR TOUCH EVENTS
    function ongoingTouchIndexById(idToFind) {
        for (var i = 0; i < ongoingTouches.length; i++) {
            var id = ongoingTouches[i].identifier;

            if (id == idToFind) {
                return i;
            }
        }
        return -1; // not found
    }

    // prevent scrolling when touching UI
    // const annoUI = document.querySelector('.annotation-ui');
    // annoUI.addEventListener('touchmove', stopMove, false);
    // function stopMove(e) {
    //   e.preventDefault();
    // }

    // LOAD PATHS ON PAGE VIEW
    loadPaths();

    // CLICK COLOR DOT IN UI
    document.getElementById('pen-color').addEventListener('click', () => {
        closeInfoBoxes();
        const swatches = document.getElementById('close-swatches');
        swatches.classList.toggle('anno-color-swatches-active');

        // SET POSITION OF PANEL (TO LEFT OR RIGHT OF PARENT DEPENDING ON PARENT POSITION)
        const annoUI = document.getElementById('annotation-ui-container');
        if (
            Number(annoUI.style.right.match(/[0-9]*/)[0]) >= window.innerWidth / 2 ||
            (annoUI.style.left.match(/[0-9]*/)[0] && annoUI.style.left.match(/[0-9]*/)[0] <= window.innerWidth / 2)
        ) {
            swatches.style.right = '-42px';
        } else {
            swatches.style.right = '182px';
        }
    });

    // PICK COLOR FROM PALETTE
    document.querySelectorAll('.anno-color-circle').forEach(element => {
        element.addEventListener('click', () => {
            closeSwatches();

            // STORE COLOR
            window.localStorage.setItem('penColor', element.style.backgroundColor);

            // UPDATE UI COLOR DOT
            document.querySelector('#pen-tip-color').style.fill = element.style.backgroundColor;

            // REMOVE UI PALETTE DOT FROM PREVIOUS COLOR
            if (document.querySelector('.acc-active')) {
                document.querySelector('.acc-active').classList = 'anno-color-circle';
            }

            // ADD UI PALETTE DOT TO NEW COLOR
            element.classList.add('acc-active');

            // UPDATE CURSOR
            updateCursor();

            // UPDATE ICONS
            setIconTips();

            if (isErasing)
                draw();
        });
    });

    // CLOSE COLOR SWATCHES WITH X
    document.getElementById('close-color-swatches').addEventListener('click', () => {
        closeSwatches();
    });

    // CLICK PEN SIZE INCREASE
    document.querySelector('#anno-plus').addEventListener('click', () => {
        closeSwatches();

        const MAXPENSIZE = 30;
        if (getPenSize() < MAXPENSIZE) {
            setPen(getPenSize() + 1);
            window.localStorage.setItem('penSize', getPenSize());
        }

        // APPLY STYLES
        document.querySelector('#anno-plus').classList.value = 'anno-plus-clicked';
        setTimeout(() => {
            document.querySelector('#anno-plus').classList.value = '';
        }, 400);
    });

    // CLICK PEN SIZE DECREASE
    document.querySelector('#anno-minus').addEventListener('click', () => {
        closeSwatches();

        const MINPENSIZE = 2;
        if (getPenSize() > MINPENSIZE) {
            setPen(getPenSize() - 1);
            window.localStorage.setItem('penSize', getPenSize());
        }

        // APPLY STYLES
        document.querySelector('#anno-minus').classList.value = 'anno-minus-clicked';
        setTimeout(() => {
            document.querySelector('#anno-minus').classList.value = '';
        }, 400);
    });

    // CLICKED ERASER ICON
    document.getElementById('anno-eraser').addEventListener('click', () => {
        closeSwatches();

        // CHANGE ERASER ICON COLOR
        const eraserIconInner = document.querySelector('.eraser-holder');
        const eraserIconUI = document.querySelector('#anno-eraser');

        // START ERASING
        isErasing = true;
        setIsHightlighting(false);

        eraserIconUI.style.opacity = 1;

        updateCursor();

        // TURN OFF MARKER UI AND HIGHLIGHTER UI
        document.querySelector('#anno-marker').style = '';
        setIconTips();
        document.querySelector('#anno-highlighter').style = '';
    });

    // CLICKED HIGHLIGHT ICON
    document.getElementById('anno-highlighter').addEventListener('click', () => {
        closeSwatches();

        // ENABLE HIGHLIGHT MODE
        isErasing = false;
        setIsHightlighting(true);

        // CHANGE HIGHLIGHTER ICON COLOR
        document.querySelector('#anno-highlighter').style.opacity = 1;
        setIconTips();

        // UPDATE CURSOR
        updateCursor();

        // TURN OFF MARKER UI AND HIGHLIGHTER UI
        document.querySelector('#anno-marker').style = '';
        document.querySelector('#anno-eraser').style = '';
    });

    document.getElementById('anno-marker').addEventListener('click', () => {
        closeSwatches();

        draw();
    });

    // UNDO BUTTON
    document.querySelector('#anno-undo').addEventListener('click', () => {
        closeSwatches();

        if (undoIndex + 1 < undoStack.length) {
            undoIndex += 1;
            loadImage(undoIndex);
        }

        if (hUndoIndex + 1 < hUndoStack.length) {
            hUndoIndex += 1;
            loadHighlights(hUndoIndex);
        }
    });

    // redo BUTTON
    document.querySelector('#anno-redo').addEventListener('click', () => {
        closeSwatches();

        if (undoIndex - 1 >= 0) {
            undoIndex -= 1;
            loadImage(undoIndex);
        }

        if (hUndoIndex - 1 >= 0) {
            hUndoIndex -= 1;
            loadHighlights(hUndoIndex);
        }
    });

    // CLICK PEN SIZE INDICATOR
    document.querySelector('#anno-pen-size').addEventListener('click', () => {
        closeSwatches();
    });

    // CLICK ON THE INFO PANE
    var isTransitioning = false;
    document.querySelector('#anno-info').addEventListener('click', () => {
        const annoUI = document.getElementById('annotation-ui-container');
        const boxes = document.querySelectorAll('.anno-info-box');

        // SETS POSITION AND ARROWS LEFT/RIGHT
        if (
            annoUI.style.right.match(/[0-9]*/)[0] >= window.innerWidth / 2 ||
            (annoUI.style.left.match(/[0-9]*/)[0] && annoUI.style.left.match(/[0-9]*/)[0] <= window.innerWidth / 2)
        ) {
            boxes.forEach(box => {
                box.style.right = '0px';
                box.style.left = '43px';
                box.classList = 'anno-info-box arrow-left';
            });
        } else {
            boxes.forEach(box => {
                box.style.left = 'unset';
                box.style.right = '43px';
                box.classList = 'anno-info-box arrow-right';
            });
        }
        togleInfoBoxes();
        closeSwatches(); // COLOR SWATCHES CLOSE
    });

    // HELPER
    function togleInfoBoxes() {
        const boxes = document.querySelectorAll('.anno-info-box');

        if (!isTransitioning) {
            isTransitioning = true;

            if (boxes[0].style.opacity === '1') {
                boxes.forEach(box => (box.style.opacity = 0));
                document.querySelector('#black-screen-bg').style.opacity = 0;

                setTimeout(() => {
                    boxes.forEach(box => (box.style.display = 'none'));
                    document.querySelector('#black-screen-bg').style.display = 'none';

                    isTransitioning = false;
                }, 500);
            } else {
                document.querySelector('#black-screen-bg').style.display = 'block';
                setTimeout(() => (document.querySelector('#black-screen-bg').style.opacity = 1), 10);

                boxes.forEach(box => {
                    box.style.display = 'block';
                    setTimeout(() => (box.style.opacity = 1), 10);
                });
                setTimeout(() => (isTransitioning = false), 500);
            }
        }
    }

    // CLOSE INFO BOXES
    function closeInfoBoxes() {
        const boxes = document.querySelectorAll('.anno-info-box');

        if (!isTransitioning) {
            isTransitioning = true;

            boxes.forEach(box => (box.style.opacity = 0));
            document.querySelector('#black-screen-bg').style.opacity = 0;
            setTimeout(() => {
                boxes.forEach(box => (box.style.display = 'none'));
                document.querySelector('#black-screen-bg').style.display = 'none';
                isTransitioning = false;
            }, 500);
        }
    }

    document.querySelector('#black-screen-bg').addEventListener('click', () => closeSwatches());

    document.querySelector('#anno-move').addEventListener('click', () => {
        closeSwatches();
    });

    function loadImage(index) {
        let context = canvasAnno.getContext('2d');

        // allows us to undo erasing
        context.globalCompositeOperation = 'source-over';

        var imageObject = new Image();
        imageObject.onload = function () {
            context.drawImage(this, 0, 0);
        };

        context.clearRect(0, 0, canvasAnno.width, canvasAnno.height);
        imageObject.src = undoStack[index].path;
        // context.drawImage(undoStack[index].path, 0, 0);
    }

    function loadHighlights(index) {
        let context = highlighter.getContext('2d');

        // allows us to undo erasing
        context.globalCompositeOperation = 'source-over';

        var imageObject = new Image();
        imageObject.onload = function () {
            context.drawImage(this, 0, 0);
        };

        context.clearRect(0, 0, canvasAnno.width, canvasAnno.height);
        imageObject.src = hUndoStack[index].path;
        // context.drawImage(undoStack[index].path, 0, 0);
    }

    //////////////////////////////////
    //////////// HELPERS ////////////
    ////////////////////////////////

    // CLEAR ANNOS
    function clearAnnotation() {
        canvasAnno.getContext('2d').clearRect(0, 0, canvasAnno.width, canvasAnno.height);
        highlighter.getContext('2d').clearRect(0, 0, canvasAnno.width, canvasAnno.height);

        storePaths();
        closeSwatches();
        draw();
    }

    // CLOSES COLOR SWATCHES
    function closeSwatches() {
        document.getElementById('close-swatches').style.opacity = '0';

        setTimeout(() => {
            document.getElementById('close-swatches').classList.remove('anno-color-swatches-active');
            document.getElementById('close-swatches').style = '';
        }, 200);

        closeInfoBoxes();
    }

    // GET PEN COLOR
    function getPenColor() {
        return window.localStorage.getItem('penColor') || 'rgb(255, 255, 0)';
    }

    // GET PEN SIZE
    function getPenSize() {
        return Number(window.localStorage.getItem('penSize')) || midPenSize;
    }

    // GET IS-HIGHLIGHTING
    function getIsHighlighting() {
        if (JSON.parse(window.localStorage.getItem('isHighlighting'))) {
            return true;
        }
        return false;
    }

    // SET IS-HIGHLIGHTING
    function setIsHightlighting(val) {
        isHighlighting = val;
        window.localStorage.setItem('isHighlighting', val);
    }

    // STORE PATHS TO LOCAL STORAGE
    function storePaths() {
        // PUT DATA INTO UNDO/REDO STACK
        if (undoIndex === 0) {
            // FIRST UNDO (INDEX IS ZERO)
            undoStack.unshift({ path: canvasAnno.toDataURL() });
        } else {
            // SUBSEQUENT UNDOS, INDEX NOT ZERO
            undoStack = undoStack.slice(undoIndex);
            undoStack.unshift({ path: canvasAnno.toDataURL() });
            undoIndex = 0;
        }

        // LIMIT SIZE OF UNDO/REDO STACK
        if (undoStack.length >= 30) {
            undoStack = undoStack.slice(0, 30);
        }

        // PUT LATEST PATH IN PERSISTANT STORAGE
        window.sessionStorage.setItem(pagePath, JSON.stringify({ path: canvasAnno.toDataURL() }));

        ////////////////////////////
        // NOW DO THE SAME FOR THE HIGHLIGHT LAYER
        // PUT DATA INTO UNDO/REDO STACK
        if (hUndoIndex === 0) {
            // FIRST UNDO (INDEX IS ZERO)
            hUndoStack.unshift({ path: highlighter.toDataURL() });
        } else {
            // SUBSEQUENT UNDOS, INDEX NOT ZERO
            hUndoStack = hUndoStack.slice(hUndoIndex);
            hUndoStack.unshift({ path: highlighter.toDataURL() });
            hUndoIndex = 0;
        }

        // LIMIT SIZE OF UNDO/REDO STACK
        if (hUndoStack.length >= 30) {
            hUndoStack = hUndoStack.slice(0, 30);
        }

        // PUT LATEST PATH IN PERSISTANT STORAGE
        window.sessionStorage.setItem(pagePath + '-h', JSON.stringify({ path: highlighter.toDataURL() }));

        // RESET EXPIRATION TIME
        window.sessionStorage.setItem('pathExpiration', Date.now() + 0 * 60000); // paths delete in 0 minutes
    }

    //LOAD STORED PATHS IF AVAILABLE
    function loadPaths() {
        // LOAD PATHS IF THEY HAVEN'T EXPIRED, and if they exist
        if (Date.now() < window.sessionStorage.getItem('pathExpiration')) {
            // IF WE HAVE PATHS ON ANY PAGE...
            if (window.sessionStorage.getItem(pagePath)) {
                // load image from data url
                let context = canvasAnno.getContext('2d');
                var imageObj = new Image();
                imageObj.onload = function () {
                    context.drawImage(this, 0, 0);
                };

                const imgStack = JSON.parse(window.sessionStorage.getItem(pagePath));
                // const lastImg = imgStack[imgStack.length - 1];
                imageObj.src = imgStack.path;

                // ADD TO UNDO STACK
                undoStack.unshift({ path: imgStack.path });

                // NOW DO THE SAME FOR THE HIGHLIGHT LAYER
                if (window.sessionStorage.getItem(pagePath + '-h')) {
                    // load image from data url
                    let context = highlighter.getContext('2d');
                    var imageObj = new Image();
                    imageObj.onload = function () {
                        context.drawImage(this, 0, 0);
                    };

                    // HIGHLIGHTS LOADED
                    const imgStack = JSON.parse(window.sessionStorage.getItem(pagePath + '-h'));
                    imageObj.src = imgStack.path;

                    // ADD TO UNDO STACK
                    hUndoStack.unshift({ path: imgStack.path });
                }
            } else {
                // IF WE DO NOT HAVE PATHS ON THIS PAGE LOAD A BLANK IMG INTO UNDO/REDO
                canvasAnno.getContext('2d').clearRect(0, 0, canvasAnno.width, canvasAnno.height);
                highlighter.getContext('2d').clearRect(0, 0, canvasAnno.width, canvasAnno.height);
                storePaths();
            }
        } else {
            // ELSE DELETE ALL STORED PATHS, BUT KEEP REST OF SESSION INFO

            // SAVE SESSION ID & TOP NAV VIS SETTING
            const sessionId = window.sessionStorage.getItem('userSessionID');
            let isTopNavVis;
            if (window.sessionStorage.getItem('isTopNavVisible')) {
                isTopNavVis = window.sessionStorage.getItem('isTopNavVisible');
            }

            // CLEAR EVERYTHING
            window.sessionStorage.clear();

            // RESET SESSION ID & TOP NAV VIS SETTING
            window.sessionStorage.setItem('userSessionID', sessionId);
            if (isTopNavVis) window.sessionStorage.setItem('isTopNavVisible', isTopNavVis);

            // LOAD BLANK IMAGE INTO UNDO/REDO
            canvasAnno.getContext('2d').clearRect(0, 0, canvasAnno.width, canvasAnno.height);
            storePaths();
        }
    }

    function draw() {
        isErasing = false;
        setIsHightlighting(false);
        // TURN OFF ERASER UI
        const eraserIconUI = document.querySelector('#anno-eraser');
        eraserIconUI.style = '';

        // TURN OFF HIGHLIGHTER UI
        document.querySelector('#anno-highlighter').style = '';

        // TURN ON MARKER UI
        document.querySelector('#anno-marker').style.opacity = 1;
        // RESET DRAWING CURSOR
        setPen(getPenSize());

        const color = document.querySelector('#pen-tip-color').style.fill;
        window.localStorage.setItem('penColor', color);

        setIconTips();
    }

    function updateCursor() {
        switch (getPenSize()) {
            case lgPenSize:
                setCursor('big');
                return;
            case midPenSize:
                setCursor('med');
                return;
            case smPenSize:
                setCursor('sm');
                return;
            default:
                setCursor('med');
        }
    }

    //SETS CURSOR SIZE AND UI DRAWING-TIP SIZE
    function setPen(caseVal) {
        let penSizeIcon = document.querySelector('#pen-scale');

        switch (caseVal) {
            case lgPenSize + 1:
            case lgPenSize:
            case midPenSize + 1:
                setCursor('big');
                penSizeIcon.style.webkitTransform = `translate(9.3px, 9.6px) scale(.5)`;
                window.localStorage.setItem('penSize', lgPenSize);
                return lgPenSize;
            case lgPenSize - 1:
            case midPenSize:
            case smPenSize + 1:
                setCursor('med');
                penSizeIcon.style.webkitTransform = `translate(10.9px, 10.9px) scale(.35)`;
                window.localStorage.setItem('penSize', midPenSize);
                return midPenSize;
            case midPenSize - 1:
            case smPenSize:
            case smPenSize - 1:
                setCursor('sm');
                penSizeIcon.style.webkitTransform = `translate(12.4px, 12.9px) scale(.2)`;
                window.localStorage.setItem('penSize', smPenSize);
                return smPenSize;
            default:
                console.log('default set pen hit');
                setCursor('med');
                penSizeIcon.style.webkitTransform = `translate(10.9px, 10.9px) scale(.35)`;
                window.localStorage.setItem('penSize', midPenSize);
                return midPenSize;
        }
    }

    function setCursor(size) {
        const color = getPenColor();
        let cursor = document.querySelector('#c-annotation');

        const offset1 = '0 10, crosshair';
        const offset2 = '16 16, crosshair';
        const offset3 = '12 12, crosshair';
        const offset4 = '8 8, crosshair';

        const imgPath = './annotations/imgs'

        if (isErasing) {
            if (size === 'big') {
                cursor.style.cursor = `url('${imgPath}/eraser-tip-big.svg') 25 25, crosshair`;
            } else if (size === 'med') {
                cursor.style.cursor = `url('${imgPath}/eraser-tip.svg') 15 15, crosshair`;
            } else {
                cursor.style.cursor = `url('${imgPath}/eraser-tip-sm.svg') 10 10, crosshair`;
            }
        } else if (isHighlighting) {
            if (size === 'big') {
                switch (color) {
                    case 'rgb(255, 255, 0)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-orange-lg.svg') ${offset1}`;
                        return;
                    case 'rgb(255, 76, 76)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-red-lg.svg') ${offset1}`;
                        return;
                    case 'rgb(255, 76, 255)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-violet-lg.svg') ${offset1}`;
                        return;
                    case 'rgb(76, 137, 253)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-blue-lg.svg') ${offset1}`;
                        return;
                    case 'rgb(52, 227, 0)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-green-lg.svg') ${offset1}`;
                        return;
                    default:
                        console.log('bad color');
                        cursor.style.cursor = `url('${imgPath}/highlighter-orange-lg.svg') ${offset1}`;
                }
            } else if (size === 'med') {
                switch (color) {
                    case 'rgb(255, 255, 0)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-orange-med.svg') ${offset1}`;
                        return;
                    case 'rgb(255, 76, 76)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-red-med.svg') ${offset1}`;
                        return;
                    case 'rgb(255, 76, 255)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-violet-med.svg') ${offset1}`;
                        return;
                    case 'rgb(76, 137, 253)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-blue-med.svg') ${offset1}`;
                        return;
                    case 'rgb(52, 227, 0)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-green-med.svg') ${offset1}`;
                        return;
                    default:
                        console.log('bad color');
                        cursor.style.cursor = `url('${imgPath}/highlighter-orange-med.svg') ${offset1}`;
                }
            } else {
                switch (color) {
                    case 'rgb(255, 255, 0)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-orange-sm.svg') ${offset1}`;
                        return;
                    case 'rgb(255, 76, 76)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-red-sm.svg') ${offset1}`;
                        return;
                    case 'rgb(255, 76, 255)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-violet-sm.svg') ${offset1}`;
                        return;
                    case 'rgb(76, 137, 253)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-blue-sm.svg') ${offset1}`;
                        return;
                    case 'rgb(52, 227, 0)':
                        cursor.style.cursor = `url('${imgPath}/highlighter-green-sm.svg') ${offset1}`;
                        return;
                    default:
                        console.log('bad color');
                        cursor.style.cursor = `url('${imgPath}/highlighter-orange-sm.svg') ${offset1}`;
                }
            }
        } else {
            if (size === 'big') {
                switch (color) {
                    case 'rgb(255, 255, 0)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-20-orange.svg') ${offset2}`;
                        return;
                    case 'rgb(255, 76, 76)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-20-red.svg') ${offset2}`;
                        return;
                    case 'rgb(255, 76, 255)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-20-violet.svg') ${offset2}`;
                        return;
                    case 'rgb(76, 137, 253)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-20-blue.svg') ${offset2}`;
                        return;
                    case 'rgb(52, 227, 0)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-20-green.svg') ${offset2}`;
                        return;
                    default:
                        console.log('bad color');
                        cursor.style.cursor = `url('${imgPath}/pen-tip-20-orange.svg') ${offset2}`;
                }
            } else if (size === 'med') {
                switch (color) {
                    case 'rgb(255, 255, 0)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-15-orange.svg') ${offset3}`;
                        return;
                    case 'rgb(255, 76, 76)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-15-red.svg') ${offset3}`;
                        return;
                    case 'rgb(255, 76, 255)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-15-violet.svg') ${offset3}`;
                        return;
                    case 'rgb(76, 137, 253)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-15-blue.svg') ${offset3}`;
                        return;
                    case 'rgb(52, 227, 0)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-15-green.svg') ${offset3}`;
                        return;
                    default:
                        console.log('bad color');
                        cursor.style.cursor = `url('${imgPath}/pen-tip-15-orange.svg') ${offset3}`;
                }
            } else {
                switch (color) {
                    case 'rgb(255, 255, 0)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-10-orange.svg') ${offset4}`;
                        return;
                    case 'rgb(255, 76, 76)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-10-red.svg') ${offset4}`;
                        return;
                    case 'rgb(255, 76, 255)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-10-violet.svg') ${offset4}`;
                        return;
                    case 'rgb(76, 137, 253)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-10-blue.svg') ${offset4}`;
                        return;
                    case 'rgb(52, 227, 0)':
                        cursor.style.cursor = `url('${imgPath}/pen-tip-10-green.svg') ${offset4}`;
                        return;
                    default:
                        cursor.style.cursor = `url('${imgPath}/pen-tip-10-orange.svg') ${offset4}`;
                        console.log('bad color');
                }
            }
        }
    }

    // Make the Annotation element draggable (desktop)
    dragElement(document.getElementById('annotation-ui-container'));

    function dragElement(elmnt) {
        document.getElementById('anno-move').onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            // POSITION TRANSITION PREVENTS DRAGGABILITY
            elmnt.style.transition = 'all 0s';
            e = e || window.event;
            e.preventDefault();

            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            // set the element's new position:
            const newTop = Number(elmnt.style.top.match(/[0-9]*/)[0]) + e.movementY;
            elmnt.style.top = newTop + 'px';

            const newRight = Number(elmnt.style.right.match(/[0-9]*/)[0]) - e.movementX;
            elmnt.style.right = newRight + 'px';
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;

            //RESTORE POSITION TRANSITION
            elmnt.style.transition = 'all .5s';

            // DETECT IF USER HAS REPOSITIONED ELEMENT
            // if (
            //     !(
            //         Number(elmnt.style.right.match(/[0-9]*/)[0]) === 0 &&
            //         (Number(elmnt.style.top.match(/[0-9]*/)[0]) === 231 ||
            //             Number(elmnt.style.top.match(/[0-9]*/)[0]) === 100)
            //     )
            // ) {
            //     elmnt.style.position = 'absolute';
            // }

            // PREVENT UI FROM GOING OFF SCREEN (left side)
            if (Number(elmnt.style.right.match(/[0-9]*/)[0]) >= window.innerWidth - 50) {
                elmnt.style.right = window.innerWidth - 50 + 'px';
            } else if (Number(elmnt.style.right.match(/[0-9]*/)[0]) <= 0) {
                // PREVENT UI FROM GOING OFF SCREEN (right side)
                elmnt.style.right = '0px';
            }

            // PREVENT UI FROM GOING OFF BOTTOM OF SCREEN
            if (Number(elmnt.style.top.match(/[0-9]*/)[0]) >= window.innerHeight - panelHeight) {
                elmnt.style.top = window.innerHeight - panelHeight + 'px';
            }
        }
    }

    // MAKE ELEMENT DRAGGABLE (IPAD AND TOUCH SCREENS)
    dragStart(document.getElementById('annotation-ui-container'));

    function dragStart(elmnt) {
        document.getElementById('anno-move').ontouchstart = touchMove;

        var moveX = 0;
        var moveY = 0;
        var startX = 0;
        var startY = 0;

        function touchMove(e) {
            // POSITION TRANSITION PREVENTS DRAGGABILITY
            elmnt.style.transition = 'all 0s';

            e = e || window.event;
            e.preventDefault();

            // get the mouse cursor position at startup:
            startX = e.pageX;
            startY = e.pageY;

            document.ontouchend = closeDragElement;
            document.ontouchcancel = closeDragElement;

            // call a function whenever the cursor moves:
            document.ontouchmove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            // CALCULATE OFFSET FROM INITIAL/START POSITION
            moveX = startX - e.pageX;
            moveY = startY - e.pageY;
            startX = e.pageX;
            startY = e.pageY;

            // set the element's new position:
            elmnt.style.top = elmnt.offsetTop - moveY + 'px';
            elmnt.style.left = elmnt.offsetLeft - moveX + 'px';
            elmnt.style.right = '1px';
        }

        function closeDragElement() {
            closeSwatches();
            // stop moving when mouse button is released:
            document.ontouchend = null;
            document.ontouchcancel = null;
            document.ontouchmove = null;

            //RESTORE POSITION TRANSITION
            elmnt.style.transition = 'all .5s';

            // PREVENT UI FROM GOING OFF SCREEN (left and right sides)
            if (Number(elmnt.style.left.match(/[0-9]*/)[0]) >= window.innerWidth - 45) {
                elmnt.style.left = window.innerWidth - 45 + 'px';
            } else if (Number(elmnt.style.left.match(/[0-9]*/)[0]) <= 0) {
                elmnt.style.left = 0 + 'px';
            }

            // PREVENT UI FROM GOING OFF BOTTOM OF SCREEN
            // PREVENT UI FROM GOING OFF top OF SCREEN
            if (Number(elmnt.style.top.match(/[0-9]*/)[0]) >= window.innerHeight - panelHeight) {
                elmnt.style.top = window.innerHeight - panelHeight + 'px';
            } else if (Number(elmnt.style.top.match(/[0-9]*/)[0]) <= 0) {
                elmnt.style.top = 24 + 'px';
            }
        }
    }

    // ON WINDOW RESIZE, RESIZE OUR ANNOTATION LAYERS
    window.addEventListener('resize', () => {
        // IF HEIGHT OR WIDTH INCREASES BY MORE THAN 25PX...
        if (window.innerWidth - screenWidth >= 25 || window.innerHeight - screenHeight >= 25) {
            setTimeout(() => {
                // RESIZE THE ANNOTATION LAYERS
                document.querySelector('#c-annotation').width = document.querySelector('body').offsetWidth;
                document.querySelector('#c-annotation').height = window.innerHeight;

                document.querySelector('#c-highlighter').width = document.querySelector('body').offsetWidth;
                document.querySelector('#c-highlighter').height = window.innerHeight;

                // UPDATE SIZES
                screenWidth = window.innerWidth;
                screenHeight = window.innerHeight;
            }, 200);
        }
    });
} else if (document.querySelector('.open-annotation-icon')) {
    document.querySelector('.open-annotation-icon').style.display = 'none';
}

//********************************* end annotation logic ******************************
//*************************************************************************************
//*************************************************************************************
//*************************************************************************************
