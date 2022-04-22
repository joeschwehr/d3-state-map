//************************** D3 CHARTS ***************************************************//
//******************************************************************************************//

class drawMap {
    constructor(element, statesData) {
        // turn off loading text
        document.querySelector("#loading").style.opacity = 0;

        this.element = element;
        this.statesData = statesData;

        this.draws = 0;
        this.usStates = usStates;

        this.DEMSColor = '#0a85ed';
        this.GOPColor = '#d81e55';

        this.oldLocation;

        // this.usCounties = usCounties;
        this.initVis();
    }

    async initVis() {
        const vis = this;

        // DIV
        vis.chartDiv = document.getElementById(vis.element);

        // SVG
        vis.svg = d3.select(vis.chartDiv).append('svg');

        // STATES GROUP
        vis.states = vis.svg
            .append('g')
            .attr('class', 'states')
            .attr('fill', 'transparent')

        // BORDERS GROUP
        vis.borders = vis.states
            .append('g')
            .attr('class', 'borders')
            .attr('stroke', '#f8f8f860')
            .style('pointer-events', 'none');

        // APPEND STATE PATHS
        vis.usStates.features.forEach((el) => {
            vis.states
                .append('path')
                .attr('id', `${el.properties.NAME}`)
                .attr('class', 'state')

            vis.borders
                .append('path')
                .attr('id', `border-${el.properties.NAME}`)
        });

        vis.appendHovers();
        vis.redraw();
    }

    appendHovers() {
        const vis = this;

        vis.stateIDs = Object.keys(popupData);

        vis.stateIDs.forEach((key, i) => {
            vis.biden = 'Joe Biden'
            vis.trump = "Donald Trump"
            const currentState = vis.statesData.find(d => d.state === popupData[key].fullname)
            const winner = currentState ? currentState.winner : null;
            const bidenVotes = currentState ? currentState[vis.biden] : null;
            const trumpVotes = currentState ? currentState[vis.trump] : null;
            const loser = bidenVotes && trumpVotes ? (bidenVotes > trumpVotes ? vis.trump : vis.biden) : null;
            const loserVotes = bidenVotes && trumpVotes ? (bidenVotes > trumpVotes ? trumpVotes : bidenVotes) : null;

            const text = `
                <div style='display: flex; justify-content: space-between; width: 102%; cursor: pointer;' onclick="closeBox(this)">
                    <div>
                        <div class='popup-header bold p-16'>${popupData[key].fullname}</div>
                        <div style='white-space: nowrap;'>${popupData[key].electoralVotes} electoral votes</div>
                        <div style='white-space: nowrap;'>${winner ? winner + ': ' + d3.format(',')(currentState[winner]) : ''}</div>
                        <div style='white-space: nowrap;'>${loser ? loser + ': ' + d3.format(',')(loserVotes) : ''}</div>

                    </div>
                </div>
            `;
            setForeignObject(key, text);
            setHiddenPopup(key, text);
        });

        function setForeignObject(key, text) {

            const leftArrowPoints = '5,20   5,30  0,25';
            const rightArrowPoints = '-8,8  0,18  -8,28';

            // append popup
            vis.states
                .append('foreignObject')
                .attr('id', `${key}-popup`)
                .attr('class', 'state-popup')
                .attr('opacity', 0)
                .html(text);

            // append separate arrow for popup
            // this is a good way to ensure the arrow is getting positioned to the center of the state...
            // this use-case works well if the height of the popups varies widely (otherwise this workflow isn't required)
            // because you can see that there's a little redundacy being done with hidden popups (which are divs)
            vis.states
                .append('polygon')
                .attr('id', `${key}-arrow`)
                .attr('class', 'white-arrow')
                .attr(
                    'points',
                    popupData[key].position === 'left' ? leftArrowPoints : rightArrowPoints
                );
        }

        function setHiddenPopup(key, text) {
            const hiddenPopupContainer = document.querySelector('leavehere');
            const hiddenPopup = document.createElement('div');
            hiddenPopup.id = `${key}-hidden`;
            hiddenPopup.classList.add('hidden-popup');
            hiddenPopup.innerHTML = text;
            hiddenPopupContainer.appendChild(hiddenPopup);
        }
    }

    redraw() {
        const narrowScreen = window.innerWidth < 1100;
        const vis = this;

        vis.draws += 1;

        // Extract the width and height that was computed by CSS.
        vis.width = vis.chartDiv.clientWidth;
        vis.height = vis.chartDiv.clientHeight;

        // Use the extracted size to set the size of an SVG element.
        vis.svg.attr('width', vis.width).attr('height', vis.height);

        // SCALING/POSITIONING params
        const scale = window.innerWidth * 0.86;
        const xPos = window.innerWidth * 0.48;
        const yMove =
            window.innerWidth < 1250 ? 0.3 : window.innerWidth < 1700 ? 0.27 : 0.29;
        const yPos = scale * yMove;

        // GEOPATH FUNCTION
        vis.path = d3.geoPath();

        // set projection
        vis.projection = d3
            .geoAlbersUsa()
            .scale(scale)
            .translate([xPos, yPos])
            .precision(0.1);

        vis.path.projection(vis.projection); // assign projection to map

        // DRAW STATES
        vis.usStates.features.forEach((el, i) => {
            const stateName = el.properties.NAME;
            const state = usStates.features.filter((d) => {
                return d.properties.NAME == stateName;
            });

            vis.borders.select(`#border-${stateName}`)
                .data(state)
                .attr('d', vis.path)
                .attr('opacity', vis.draws === 1 ? 0 : 1)
                .transition()
                .duration(1500)
                .delay(i * 8 + 333)
                .attr('opacity', 1);

            vis.states
                .select(`#${stateName}`)
                .data(state)
                .attr('d', vis.path)
                // .attr('fill', myColor(vis.data[stateName].status))
                .attr('cursor', 'pointer')
                .on('click', (d) => vis.clicked(d.properties.NAME))
                .on('touch', (d) => vis.clicked(d.properties.NAME))
        });

        // DRAW COUNTIES (todo)

        setTimeout(
            () => {
                vis.positionPopups();

                // called twice
                // POSITION POPUPS (DELAY IS NEEDED on resize, BECAUSE THE MAP HAS A TRANSITION
                if (vis.draws === 1) {
                    setTimeout(() => {
                        vis.positionPopups();
                    }, 1500);
                }

            },
            vis.draws === 1 ? 500 : 0
        );
    } // end redraw ***************************************

    // MOVE AND SIZE POPUPS
    positionPopups() {
        const vis = this;

        // SET POPUP WIDTHS ON EACH REDRAW
        vis.stateIDs.forEach((id) => {
            const currentPopup = document.querySelector(`#${id}-popup`)
            currentPopup.setAttribute('width', document.getElementById(`${id}-hidden`).clientWidth)
            currentPopup.setAttribute('height', document.getElementById(`${id}-hidden`).clientHeight);
        });

        document.querySelectorAll('.state-popup').forEach((popup) => {
            const ID = popup.id.split('-')[0];

            const CENTER = vis.path.centroid(
                usStates.features.find((d) => d.properties.NAME === ID)
            );

            const arrowWidth = 7;
            let offsetX = document.getElementById(`${ID}-hidden`).clientWidth + arrowWidth;

            // POSITION POPUPS
            if (ID === 'HI') {
                const moveUp = -popup.clientHeight * 0.4;
                popup.setAttribute('x', CENTER[0] + 23);
                popup.setAttribute('y', CENTER[1] + moveUp);
            } else {
                const moveUp = -popup.clientHeight * 0.4;
                popup.setAttribute('x', CENTER[0] + 4);
                popup.setAttribute('y', CENTER[1] + moveUp);
            }

            // POSITION ARROWS TO STATE CENTERS
            d3.select(`#${ID}-arrow`).style('transform', getTranslate);

            function getTranslate() {
                let xPosition = CENTER[0];
                let yPosition = CENTER[1] - 20;

                if (ID === 'NJ') {
                    xPosition = CENTER[0] + 8;
                } else if (ID === 'MD') {
                    yPosition = CENTER[1] - 30;
                } else if (ID === 'MA') {
                    yPosition = CENTER[1] - 28;
                } else if (ID === 'CT') {
                    yPosition = CENTER[1] - 25;
                } else if (ID === 'HI') {
                    xPosition = CENTER[0] + 19;
                    yPosition = CENTER[1] - 15;
                }

                return `translate(${xPosition}px, ${yPosition}px)`;
            }
        });
    }

    // zoom in and out, and highlight states
    clicked(locationName) {
        const vis = this;

        let xPos, yPos, scaleValue;
        let newTranslate = 0.25;
        let offset = [0, 0];

        // RESET WHEN 'X' IN POPUP WAS CLICKED
        if (!locationName) {
            resetMapDefaults();
            moveMap();
            return;
        }
        ///////////////////////////////////////////////

        // get current state geometry
        const currentStateGeometry = usStates.features.find(
            (d) => d.properties.NAME == locationName
        );

        if (locationName !== vis.oldLocation) {
            offset = vis.getOffset(locationName);

            const centroid = vis.path.centroid(currentStateGeometry);
            xPos = centroid[0];
            yPos = centroid[1];

            newTranslate = 0.25;
            scaleValue = 2;

            vis.oldLocation = locationName;

            addHighlightAndPopup(currentStateGeometry);
            moveMap();
        } else {
            // ELSE, RESTORE TO ORIGINAL ZOOM, OPACITY
            resetMapDefaults();
            moveMap();
        }

        function resetMapDefaults() {
            xPos = vis.width / 4;
            yPos = vis.height / 2;
            newTranslate = 0;
            scaleValue = 1;
            vis.oldLocation = null;

            // state paths
            vis.states.selectAll('path').transition().duration(500).attr('opacity', .2);

            // borders
            vis.borders.selectAll('path').transition().duration(500).attr('opacity', 1);

            vis.hidePopups();

            // remove highlighted state from dropdown list
            document.querySelectorAll('.state-item').forEach((state) => {
                state.classList.remove('active');
            });
        }

        function addHighlightAndPopup(currentStateGeometry) {
            // dim other states
            vis.states.selectAll('path').transition().duration(500).attr('opacity', 0.2);

            const state = currentStateGeometry.properties.NAME;
            const fullStateName = popupData[state].fullname
            const stateData = vis.statesData.find(d => d.state === fullStateName)

            // highlight clicked state
            vis.states
                .select(`#${state}`)
                .transition()
                .duration(500)
                .attr('opacity', 1)
                .attr('fill', stateData ? (stateData.winner === vis.biden ? vis.DEMSColor : vis.GOPColor) : 'grey')

            //add active state to dropdown item
            document.querySelectorAll('.state-item').forEach((state) => {
                state.classList.remove('active');
            });
            document.getElementById(`${locationName}`).classList.add('active');

            // HIDE POPUPS
            setTimeout(() => {
                vis.hidePopups();
            }, 300);

            // SHOW POPUP
            setTimeout(() => {
                document.getElementById(`${locationName}-popup`).setAttribute('opacity', 1);
                document.getElementById(`${locationName}-popup`).style.pointerEvents =
                    'all';
                document.getElementById(`${locationName}-popup`).classList.add(`active`);
                document.getElementById(`${locationName}-arrow`).style.opacity = 1;
            }, 700);
        }

        function moveMap() {
            vis.states
                .transition()
                .duration(1750)
                .attr(
                    'transform',
                    `translate(${vis.width / 4}, ${vis.height / 2
                    }) scale(${scaleValue}) translate(${-xPos + offset[0]}, ${-yPos + offset[1]
                    })`
                );
        }
    }

    hidePopups() {
        // HIDE ALL POPUS
        document
            .querySelectorAll('.state-popup')
            .forEach((el) => el.setAttribute('opacity', 0));
        document
            .querySelectorAll('.state-popup')
            .forEach((el) => (el.style.pointerEvents = 'none'));

        // DIM ALL ARROWS
        document.querySelectorAll('.white-arrow').forEach((el) => (el.style.opacity = 0));
    }

    getOffset(locationName) {

        return [window.innerWidth * 0.09, window.innerHeight * -.05];
    }
} // end of class

//*************************************************************************************************//
//*************************************************************************************************//

function resetMap() {
    chart.clicked(null);
}

// CLOSE HOVER BOX WITH X
function closeBox() {
    chart.clicked(null);
}
