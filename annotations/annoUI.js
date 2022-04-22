
// document.addEventListener('DOMContentLoaded', function () {
console.log('annotations UI running');

// STYLESHEET
const styles = document.createElement("link");
styles.href = './annotations/annotations.css';
styles.type = "text/css";
styles.rel = "stylesheet";
// loadEngine.defer = true;
document.head.appendChild(styles);

// ****************************************************************************************************************************** //
// Annotation UI
// ****************************************************************************************************************************** //
const openAnnotations = `
      <div class='open-annotation-icon' style='z-index: 900'>
        <svg xmlns="http://www.w3.org/2000/svg" width="106.609" height="123" viewBox="0 0 106.609 123">
          <g>
              <path fill='rgba(0, 0, 0, 0)' class="open-annotation-circle" d="M43.609,0C67.694,0,87.219,17.763,87.219,39.676S67.694,79.352,43.609,79.352,0,61.588,0,39.676,19.525,0,43.609,0Z" transform="translate(19.391 22)"/>
          </g>
        </svg>
      </div>`;
let openAnnoCircle = document.createElement('div');
openAnnoCircle.id = 'open-anno-icon';
openAnnoCircle.style.opacity = 0;
openAnnoCircle.style.zIndex = 900;
openAnnoCircle.style.position = 'relative'; // trust us, we need this so it doesn't transition weird
openAnnoCircle.style.transition = '.7s opacity ease-in-out .3s';
openAnnoCircle.innerHTML = openAnnotations;
document.body.appendChild(openAnnoCircle);
setTimeout(() => {
  openAnnoCircle.style.opacity = 1; // fade open/close UI 
}, 0);

const annotationPanel = `
                          <div class='annotation-info-boxes'>
                            <div class='anno-info-box arrow-right' id='info-box-1'>INCREASE SIZE</div>
                            <div class='anno-info-box arrow-right' id='info-box-2'>SIZE INDICATOR</div>
                            <div class='anno-info-box arrow-right' id='info-box-3'>DECREASE SIZE</div>
                            <div class='anno-info-box arrow-right' id='info-box-4'>COLOR PICKER</div>
                            <div class='anno-info-box arrow-right' id='info-box-5'>MARKER</div>
                            <div class='anno-info-box arrow-right' id='info-box-6'>HIGHLIGHTER</div>
                            <div class='anno-info-box arrow-right' id='info-box-7'>ERASER</div>
                            <div class='anno-info-box arrow-right' id='info-box-8'>UNDO</div>
                            <div class='anno-info-box arrow-right' id='info-box-9'>REDO</div>
                            <div class='anno-info-box arrow-right' id='info-box-9a'>CLEAR ALL</div>
                            <div class='anno-info-box arrow-right' id='info-box-10'>REPOSITION</div>
                            <div id='black-screen-bg'></div>
                          </div>
                          <div class='annotation-ui'>
                            <div id='close-annotation-ui'>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
                                <defs><style>.aclose{opacity:1;}.bclose{fill-rule:evenodd;}</style></defs>
                                <g class="aclose">
                                    <path class="bclose" d="M19,6.41,17.59,5,12,10.59,6.41,5,5,6.41,10.59,12,5,17.59,6.41,19,12,13.41,17.59,19,19,17.59,13.41,12Z" transform="translate(-5 -5)"/>
                                </g>
                              </svg>
                            </div>

                            <div class='annotation-tools'>
                              
                              <div id='anno-plus'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                                  <defs><style>.a1{fill:none;}.b1{fill-rule:evenodd;}</style></defs>
                                  <rect class="a1" width="22" height="22" style='stroke: none;'/><path class="b1" 
                                    d="M15,10.714H10.714V15H9.286V10.714H5V9.286H9.286V5h1.429V9.286H15Z" 
                                    transform="translate(0.739 1)"/>
                                </svg>
                              </div>

                              <div id='anno-pen-size'>  
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                                  <defs><style>.a,.c{fill:none; stroke:rgba(139, 139, 139, 1);}.a{stroke:#707070;}.b{stroke:none;}</style></defs>
                                  <g class="a">
                                    <circle class="b" cx="11" cy="11" r="11"/>
                                    <circle class="c" cx="15" cy="15" r="11"/>
                                  </g>
                                    <circle id='pen-scale' cx="11" cy="11" r="11"/>
                                </svg>
                              </div>

                              <div id='anno-minus'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
                                  <defs><style>.apm{fill-rule:evenodd;opacity:1;}</style></defs>
                                  <path class="apm" d="M15,12.429H5V11H15Z" transform="translate(0.739 -1)"/>
                                  <rect style='fill:none;stroke-width:0;' class="bpm" width="22" height="22"/>
                                </svg>
                              </div>

                              <div id='anno-color'>
                                <div id="pen-color">
                                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="26.264" height="26" viewBox="0 0 26.264 26">
                                      <defs>
                                          <style>
                                              .a-color-select {
                                                  fill:url(#a-color-select);
                                              }
                                              .b-color-select {
                                                  fill:#fff;
                                              }
                                              .c-color-select {
                                                  fill:#ffb100;
                                              }
                                              .d-color-select {
                                                  fill:none;
                                              }
                                          </style>
                                          <linearGradient id="a-color-select" x1="0.19" y1="0.095" x2="0.828" y2="0.892" gradientUnits="objectBoundingBox">
                                              <stop offset="0" stop-color="red"/>
                                              <stop offset="0.029" stop-color="#ff0004"/>
                                              <stop offset="0.13" stop-color="#ff00ec"/>
                                              <stop offset="0.274" stop-color="#9d00ff"/>
                                              <stop offset="0.409" stop-color="#1300ff"/>
                                              <stop offset="0.533" stop-color="#009dff"/>
                                              <stop offset="0.658" stop-color="#00ffa7"/>
                                              <stop offset="0.76" stop-color="#9dff00"/>
                                              <stop offset="0.881" stop-color="#ffc400"/>
                                              <stop offset="1" stop-color="red"/>
                                          </linearGradient>
                                      </defs>
                                          <circle class="a-color-select" cx="13" cy="13" r="13"/>
                                          <circle class="b-color-select" cx="11" cy="11" r="11" transform="translate(2 2)"/>
                                          <circle id='pen-tip-color' class="c-color-select" cx="8" cy="8" r="8" transform="translate(5 5)"/>
                                          <rect class="d-color-select" width="26" height="26" transform="translate(0.264)"/>
                                  </svg>
                                </div>
                              </div>
                          
                              <div id='anno-marker'>
                              <svg xmlns="http://www.w3.org/2000/svg" width="29.98" height="22.505" viewBox="0 0 29.98 22.505">
                                <defs>
                                    <style>
                                        .a-marker{fill:#8d8d8d;}
                                        .b-marker, .e-marker {fill:none;}
                                        .b-marker, .c-marker {stroke:#000;}
                                        .d-marker {stroke:none;}
                                    </style>
                                </defs>
                                <g transform="translate(-485.812 -1897.582) rotate(60)">
                                    <path id='marker-tip' class="a-marker" d="M-.011,0H4.862S4.372,3.076,3.154,3.918s-.264.762-1.483-.08S-.011,0-.011,0Z" transform="translate(1901.069 530.911)"/>
                                    <g class="b-marker" transform="translate(1899 509)">
                                        <rect class="d-marker" width="9" height="18"/>
                                        <rect id='marker-body' class="e-marker" x="0.5" y="0.5" width="8" height="17"/>
                                    </g>
                                    <line class="b-marker" y2="7" transform="translate(1904.134 509.402)"/>
                                    <path d="M-1.352-.023l7.642.008L5,4H0Z" transform="translate(1901 527)"/>
                                    <g class="c-marker" transform="translate(1900 506)">
                                        <rect class="d-marker" width="7" height="3"/>
                                        <rect class="e-marker" x="0.5" y="0.5" width="6" height="2"/>
                                    </g>
                                </g>
                            </svg>
                              </div>

                              <div id='anno-highlighter'>
                              <svg xmlns="http://www.w3.org/2000/svg" width="27.972" height="23.078" viewBox="0 0 27.972 23.078">
                                <defs>
                                  <style>
                                    .a-highlighter {fill:#8d8d8d;}
                                    .b-highlighter, .e-highlighter {fill:none;}
                                    .b-highlighter {stroke:#000;}
                                    .c-highlighter, .d-highlighter {stroke:none;}
                                  </style>
                                </defs>
                                <g transform="translate(-2725.24 -5836.311) rotate(60)">
                                  <path id='highlighter-tip' class="a-highlighter" d="M0,0H4.288V4.735L0,6.511Z" transform="translate(6432.219 557.861)"/>
                                  <g transform="translate(6428 550.304)">
                                    <path class="c-highlighter" d="M 8.705153465270996 7.785061836242676 L 3.839731693267822 7.763185977935791 C 3.768407583236694 6.409855842590332 3.385487794876099 4.464711666107178 2.112930059432983 2.18862771987915 C 1.726641774177551 1.497718811035156 1.341567635536194 0.9245511293411255 1.032075524330139 0.4999976456165314 L 11.08681869506836 0.4999976456165314 C 10.29624366760254 1.825021147727966 8.849310874938965 4.651151657104492 8.705153465270996 7.785061836242676 Z"/><path class="d" d="M 1.98372745513916 0.999997615814209 C 2.91178035736084 2.435868740081787 4.059597492218018 4.678589820861816 4.305313110351562 7.26526927947998 L 8.237677574157715 7.282949924468994 C 8.457772254943848 4.744319438934326 9.45604133605957 2.447606563568115 10.23133659362793 0.999997615814209 L 1.98372745513916 0.999997615814209 M 0 -1.9073486328125e-06 L 12 -1.9073486328125e-06 C 12 -1.9073486328125e-06 9.193519592285156 3.948897838592529 9.193519592285156 8.287257194519043 L 3.353019714355469 8.260997772216797 C 3.353019714355469 3.733357429504395 0 -1.9073486328125e-06 0 -1.9073486328125e-06 Z"/>
                                  </g>
                                  <g class="b-highlighter" transform="translate(6428 539)">
                                    <rect class="c-highlighter" width="12" height="12"/>
                                    <rect id='highlighter-body' class="e-highlighter" x="0.5" y="0.5" width="11" height="11"/>
                                  </g>
                                </g>
                              </svg>
                              </div>

                              <div id='anno-eraser'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="23.66" height="22.196" viewBox="0 0 23.66 22.196">
                                  <defs>
                                    <style>
                                      .a-erasure {fill:#fff;stroke:#000;}
                                      .b-erasure {stroke:none;}
                                      .c-erasure {fill:none;}
                                    </style>
                                  </defs>
                                  <g class="eraser-holder" transform="translate(0 -1.118)">
                                    <g class="a-erasure" transform="translate(0 22.314)">
                                        <rect style='stroke: grey' width="23" height="1"/>
                                        <rect class="c-erasure" x="0.5" y="0.5" width="22"/>
                                    </g>
                                    <g class="a-erasure" transform="translate(17.66 1.118) rotate(60)">
                                        <rect class="b-erasure" width="12" height="14"/>
                                        <rect id='eraser-path' class="c-erasure" x="0.5" y="0.5" width="11" height="13"/>
                                    </g>
                                    <path d="M0,3H12l-.29,2.308L9.253,9.565s-6.491.591-7.815-.474S0,3,0,3Z" transform="translate(9 6.118) rotate(60)"/>
                                  </g>
                                </svg>
                              </div>

                              <hr/>

                              <div id='anno-undo'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 30 30">
                                  <defs><style>.auu{opacity:0.7;}.buu{fill:none;}</style></defs>
                                  <g class="auu" transform="translate(1.77 3)">
                                    <path d="M861,459.088V456.94h.3c1.555,0,3.109.005,4.664.016a6.147,6.147,0,0,0,5.536-3.905,6.5,6.5,0,0,0-2.979-8.228,5.624,5.624,0,0,0-2.554-.635c-3.819,0-7.639.008-11.458.014-.834,0-1.667,0-2.539.066l5.886,5.564-1.368,1.586-8.782-8.311,8.8-8.3,1.369,1.571-6.006,5.681h.381c4.578,0,9.156-.046,13.733.016a7.688,7.688,0,0,1,7.194,4.63,8.384,8.384,0,0,1-1.034,9.371,7.649,7.649,0,0,1-6.125,3c-1.554.029-3.109.005-4.664.005Z" transform="translate(-847.7 -434.811)"/>
                                  </g>
                                  <rect class="buu" width="30" height="30"/>
                                </svg>
                              </div>

                              <div id='anno-redo'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 30 30">
                                  <defs><style>.annr{opacity:0.7;}.bnnr{fill:none;}</style></defs>
                                  <g class="annr" transform="translate(1.77 3)">
                                    <path d="M860.844,459.088V456.94h-.3c-1.555,0-3.109.005-4.664.016a6.147,6.147,0,0,1-5.536-3.905,6.5,6.5,0,0,1,2.979-8.228,5.624,5.624,0,0,1,2.554-.635c3.819,0,7.639.008,11.458.014.834,0,1.667,0,2.539.066l-5.886,5.564,1.368,1.586,8.782-8.311-8.8-8.3-1.369,1.571,6.006,5.681H869.6c-4.578,0-9.156-.046-13.733.016a7.688,7.688,0,0,0-7.194,4.63,8.384,8.384,0,0,0,1.034,9.371,7.649,7.649,0,0,0,6.125,3c1.554.029,3.109.005,4.664.005Z" transform="translate(-847.7 -434.811)"/>
                                  </g>
                                  <rect class="bnnr" width="30" height="30"/>
                                </svg>
                              </div>

                              <div id='anno-info'>
                                ?
                              </div>

                              <hr/>

                              <div id='anno-clear-btn' onClick='clearAnnotation()'>
                                  <div>clear</div>
                              </div>

                              <div id='anno-move'>
                                <div>
                                  <div></div>
                                  <div></div>
                                  <div></div>
                                </div>
                              </div>

                              <div class='anno-color-swatches' id='close-swatches'>
                                <div>
                                  <p>Pen Color</p>
                                  <svg id="close-color-swatches" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
                                    <g>
                                        <path d="M19,6.41,17.59,5,12,10.59,6.41,5,5,6.41,10.59,12,5,17.59,6.41,19,12,13.41,17.59,19,19,17.59,13.41,12Z" transform="translate(-5 -5)"/>
                                    </g>
                                  </svg>
                                </div>
                                <hr/>
                                <div>
                                  <div class='anno-color-circle' style='background-color: rgb(52, 227, 0);'></div>
                                  <div class='anno-color-circle' style='background-color: rgb(76, 137, 253);'></div>
                                  <div class='anno-color-circle' style='background-color: rgb(255, 76, 255);'></div>
                                  <div class='anno-color-circle' style='background-color: rgb(255, 76, 76);'></div>
                                  <div class='anno-color-circle' style='background-color: rgb(255, 255, 0);'></div>
                                </div>
                              </div>
                            </div>
                          </div>

                        `;

let annoUi = document.createElement('div');
annoUi.id = 'annotation-ui-container';

function setHeight() {
  if (window.innerHeight > 770) {
    annoUi.style.top = '231px';
  } else {
    annoUi.style.top = '100px';
  }
}

setHeight();

window.addEventListener('resize', setHeight);

annoUi.style.opacity = 0;
annoUi.style.right = '-45px';
annoUi.innerHTML = annotationPanel;

document.body.appendChild(annoUi);

// add canvas layers (one for pen tool, one for hightlighter)
let cAnno = document.createElement('canvas');
cAnno.id = 'c-annotation';
cAnno.classList = 'c-annotation';

let cHighlighter = document.createElement('canvas');
cHighlighter.id = 'c-highlighter';
cHighlighter.classList = 'c-highlighter';

let canvasContainer = document.createElement('div');
canvasContainer.id = 'canvas-container';
document.body.appendChild(canvasContainer);

canvasContainer.appendChild(cHighlighter);
canvasContainer.appendChild(cAnno);

// canvasContainer.style.top = '0px';

// ****************************************************************************************************************************** //
// APPEND ANNOTATION ENGINE/SCRIPT
// ****************************************************************************************************************************** //

const annoFunctions = document.createElement('script');
annoFunctions.src = './annotations/anno-functions.js';
document.head.appendChild(annoFunctions);
// });
