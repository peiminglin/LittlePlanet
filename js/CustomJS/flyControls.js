window.PLANET = window.PLANET || {};
PLANET.flyControls = PLANET.flyControls || {};

PLANET.flyControls.FlyControls = function (camera) {
    camera.rotation.set(0, 0, 0);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 1);

    let holder = new THREE.Object3D();
    holder.add(camera);

    //Some preset values;
    const PI_2 = Math.PI / 2;
    const DEG1 = Math.PI / 180;
    const dirLeft = new THREE.Vector3(-1, 0, 0);
    // const dirUp = new THREE.Vector3(0, 1, 0);
    // const dirFront = new THREE.Vector3(0, 0, 1);

    let nearGround = false;   //If it's on minimum distance.
    let flyMode = false;      //If it's on self control mode. For demonstrate use.
    let freeControl = false;  //If it's on free control mode.

    //All different direction controls
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let moveUp = false;
    let moveDown = false;
    let headUp = false;
    let headDown = false;
    let turnLeft = false;
    let turnRight = false;
    let rollLeft = false;
    let rollRight = false;

    //Some letiables for flymode.
    let facingTo = new THREE.Vector3();
    let velocity = new THREE.Vector3();
    let velocityNew = new THREE.Vector3();
    let facingPoint = new THREE.Vector3();
    let facingTarget = new THREE.Vector3();
    let movingTarget = new THREE.Vector3();
    let flySpeed = 1;

    // let height = params.PlanetRadius * params.CameraMax;
    let tiltedAngle = 0;

    //Some temporary letiables to be reuse.
    //I'm not sure if keep creating new Vector3 would be slower than reusing a exist value.
    let tempVector = new THREE.Vector3();
    let tempVector2 = new THREE.Vector3();
    let tempObj = new THREE.Object3D();

    this.object = holder;             //The object that hold the camera.
    this.position = holder.position;  //Holder's position.
    this.movingSpeed = 1;            //Camera Moving speed.
    this.rotatingSpeed = 1;           //Camera rotating speed.
    this.tiltToAngle = DEG1 * 30;       //The angle that camera need to tilt when it's on ground.
    // this.minDistance = params.PlanetRadius * (1.1 + params.TerrainDisplacement / 100);  //The minimum distance of Camera to central of the planet.
    this.minDistance = utils.getPeakLevel() + 10;
    this.maxDistance = params.PlanetRadius * 4;     //The maximum distance of camera to central of the planet.
    this.viewChangingDist = params.PlanetRadius * 0.3;  //The distance that camera starts to change the angle when close to planet.

    holder.position.set(0, 0, params.PlanetRadius * params.CameraMax);

    //Get the direction in world coordinate.
    function directionToWorld(obj, dir) {
        obj.localToWorld(dir);
        dir.sub(obj.getWorldPosition(dir.clone()));
    }

    //Tilt the camera.
    function tiltCamera(ang) {
        camera.rotateX(ang);
        tiltedAngle += ang;
    }

    function tiltCameraTo(ang) {
        tiltCamera(ang - tiltedAngle);
    }

    //Reset the camera to origin state;
    function resetCamera() {
        nearGround = false;
        holder.position.set(0, 0, params.PlanetRadius * params.CameraMax);
        holder.rotation.set(0, 0, 0);
        holder.lookAt(0, 0, 0);
        tiltCameraTo(0);
    }

    //Set camara's angle to x, 0 when camera looks at (0, 0, 0), PI/2 when camera looks at tangent direction.
    function rotateHolderXTo(x) {
        holder.getWorldDirection(tempVector);
        let ang = holder.position.angleTo(tempVector);
        ang = Math.PI - ang;
        let myLeft = dirLeft.clone();
        directionToWorld(holder, myLeft);
        holder.rotateOnWorldAxis(myLeft, x - ang);
    }

    //Key down event handler
    let onKeyDown = function (event) {
        if (freeControl) {
            switch (event.keyCode) {
                case 38:
                    moveForward = true;
                    break;  // up
                case 40:
                    moveBackward = true;
                    break;  // down
                case 37:
                    turnLeft = true;
                    break;  // left
                case 39:
                    turnRight = true;
                    break;  // right
                case 87:
                    moveUp = true;
                    break;  // w
                case 83:
                    moveDown = true;
                    break;  // s
                case 65:
                    moveLeft = true;
                    break;  // a
                case 68:
                    moveRight = true;
                    break;  // d
                case 82:
                    headUp = true;
                    break;  // R
                case 70:
                    headDown = true;
                    break;  // F
                case 81:
                    rollLeft = true;
                    break;  // Q
                case 69:
                    rollRight = true;
                    break;  // E
            }
        }
        else {
            switch (event.keyCode) {
                case 38:
                    moveForward = true;
                    break;  // up
                case 40:
                    moveBackward = true;
                    break;  // down
                case 37:
                    if (nearGround) turnLeft = true;
                    else moveLeft = true;
                    break;  // left
                case 39:
                    if (nearGround) turnRight = true;
                    else moveRight = true;
                    break;  // right
            }
        }
    };

    //Key up event handler
    let onKeyUp = function (event) {
        if (freeControl) {
            switch (event.keyCode) {
                case 38:
                    moveForward = false;
                    break;  // up
                case 40:
                    moveBackward = false;
                    break;  // down
                case 37:
                    turnLeft = false;
                    break;  // left
                case 39:
                    turnRight = false;
                    break;  // right
                case 87:
                    moveUp = false;
                    break;  // w
                case 83:
                    moveDown = false;
                    break;  // s
                case 65:
                    moveLeft = false;
                    break;  // a
                case 68:
                    moveRight = false;
                    break;  // d
                case 82:
                    headUp = false;
                    break;  // R
                case 70:
                    headDown = false;
                    break;  // F
                case 81:
                    rollLeft = false;
                    break;  // Q
                case 69:
                    rollRight = false;
                    break;  // E
                case 27:
                    flyMode = false;
                    resetCamera();
                    break;  //ESC
                case 13:
                    flyMode = true;
                    initFlymode();
                    break;
                case 84:
                    test();
                    break;
            }
        }
        else {
            switch (event.keyCode) {
                case 38:
                    moveForward = false;
                    break;  // up
                case 40:
                    moveBackward = false;
                    break;  // down
                case 37:
                    if (nearGround) turnLeft = false;
                    else moveLeft = false;
                    break;  // left
                case 39:
                    if (nearGround) turnRight = false;
                    else moveRight = false;
                    break;  // right
                case 27:
                    flyMode = false;
                    resetCamera();
                    break;
                case 13:
                    flyMode = true;
                    initFlymode();
                    break;
                case 84:
                    test();
                    break;
            }
        }
    };

    //Add Keyboard event.
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    //dirX for left(1) or right(-1), dirY for forward(1) or backward(-1).
    function orbitTo(dirX, dirY, speed) {
        if (dirX == 0 && dirY == 0) return;

        let obLeft = dirLeft.clone();
        directionToWorld(holder, obLeft);
        let obUp = holder.position.clone().normalize();
        let obFront = new THREE.Vector3().crossVectors(obLeft, obUp).normalize();

        //To left or right.
        if (dirX != 0) {
            tempVector.copy(obFront);
            holder.rotateOnWorldAxis(tempVector, speed * dirX);
            holder.position.applyAxisAngle(tempVector, speed * dirX);
        }

        //For forward and backward;
        if (dirY != 0) {
            tempVector.copy(obLeft);
            holder.rotateOnWorldAxis(tempVector, -speed * dirY);
            holder.position.applyAxisAngle(tempVector, -speed * dirY);
        }
    }

    //Main function of camera. Needs to be called for controls and movements.
    this.update = function () {
        holder.getWorldDirection(facingTo);

        //Self-control flying mode.
        if (flyMode) {
            this.fly();
        } else {
            //Rotate holder
            holder.rotateY(DEG1 * this.rotatingSpeed * (Number(turnLeft) - Number(turnRight)));
            holder.rotateZ(DEG1 * this.rotatingSpeed * (Number(rollLeft) - Number(rollRight)));
            holder.rotateX(DEG1 * this.rotatingSpeed * (Number(headDown) - Number(headUp)));

            //When camera is on the minDistance
            if (nearGround) {
                //move backward allow user to exit the nearGround level.
                //Transfer the turnleft to moveleft value so that if user hold the left key,
                //movement is smoothly changed while switching key control.
                if (moveBackward) {
                    nearGround = false;
                    moveLeft = turnLeft;
                    turnLeft = false;
                    moveRight = turnRight;
                    turnRight = false;
                }
                //Move forward to keep user in the same height.
                else {
                    orbitTo(0, Number(moveForward) - Number(moveBackward), this.movingSpeed / this.position.length());
                }
            }
            //When camera close enough to change the camera's angle.
            else {
              //For orbit left or right.
                orbitTo(Number(moveLeft) - Number(moveRight), 0, this.rotatingSpeed * DEG1);

                //Move forward and get the distance.
                let height = holder.position.length();
                if (height <= this.minDistance + this.viewChangingDist && height > this.minDistance) {
                    let orbitalMovement = facingTo.clone().setLength(this.movingSpeed);
                    holder.position.add(orbitalMovement.multiplyScalar(Number(moveForward) - Number(moveBackward)));

                    //This is the percentage of how much the camera has moved from the view-changing distance to current height.
                    let distPercent = (this.minDistance + this.viewChangingDist - height) / this.viewChangingDist;

                    let verticalCompensation = utils.map(distPercent, 0, 1, 0, this.movingSpeed);
                    let verticalMovement = holder.position.clone().normalize().setLength(verticalCompensation);
                    holder.position.add(verticalMovement.multiplyScalar(Number(moveBackward) - Number(moveForward)));

                    if (holder.position.length() <= this.minDistance) {
                        distPercent = 1;
                    }

                    //Change the angle depends on the distance(distPercent).
                    let ag = distPercent * PI_2;
                    rotateHolderXTo(ag);
                    let ttAngle = distPercent * this.tiltToAngle;
                    tiltCameraTo(-ttAngle);

                    //Once the view-changing period is passed, it reachs the minDistance which is the nearGround level.
                    if (distPercent >= 1) {
                        nearGround = true;
                        turnLeft = moveLeft;
                        moveLeft = false;
                        turnRight = moveRight;
                        moveRight = false;
                    }
                }
                //When camera still far way.
                else {
                    let length = holder.position.length() - (Number(moveForward) - Number(moveBackward)) * this.movingSpeed;
                    length = length < this.maxDistance ? length : this.maxDistance;
                    holder.position.setLength(length);
                }
            }
        }

        //Just to make sure holder doesn't go under the minDistance;
        if (holder.position.length() < this.minDistance) {
            holder.position.setLength(this.minDistance);
        }
    };

    //A random point around planet. Always move a quarter of planet.
    //Camera should not move under minDistance during movement.
    let randomDest = function (vec, min, max) {
        tempVector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        let randMin = min / Math.sin(Math.PI / 4);
        vec.crossVectors(vec, tempVector).setLength((Math.random() * (max - randMin)) + randMin);
    };

    //For looking points. Camera should always look at the planet.
    let randomPos = function (position, height) {
        position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).setLength(height);
    };

    //Initialize letiables before enter to fly mode.
    function initFlymode() {
        movingTarget.copy(holder.position);
        holder.getWorldDirection(tempVector2);
        tempVector2.normalize();
        facingTarget.copy(holder.position.clone().add(tempVector2)).setLength(params.PlanetRadius);
        facingPoint.copy(facingTarget);
        velocityNew.copy(tempVector2).setLength(flySpeed);
        velocity.copy(velocityNew);
    }

    //Fly mode.
    this.fly = function () {
        //If movingTarget is reached. Randomize movingTarget again.
        if (holder.position.distanceTo(movingTarget) < 5) {
            movingTarget.copy(holder.position);
            randomDest(movingTarget, this.minDistance, this.minDistance * 2);
            velocity.copy(velocityNew);
        } else {
            //Move from current point to movingTarget.
            velocity.multiplyScalar(0.9);
            velocityNew.copy(movingTarget.clone().sub(holder.position)).setLength(flySpeed);
            let move = velocity.clone().add(velocityNew);
            move.add(holder.position);
            if (move.length() < this.minDistance)
                move.setLength(this.minDistance);
            holder.position.copy(move);
        }

        //If facingPoint reached facingTarget, randomize facingTarget again.
        if (facingTarget.distanceTo(facingPoint) < 5) {
            randomPos(facingTarget, params.PlanetRadius);
        }
        else {
            facingPoint.add(facingTarget.clone().sub(facingPoint).normalize());
        }

        //Keep looking at facingPoint.
        holder.lookAt(facingPoint);
    };

    //Just for test purpose.
    function test() {
        //Whatever needs to be tested goes here.
    }

    holder.lookAt(0, 0, 0);
    //return holder;
};
