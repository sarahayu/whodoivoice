

function resolveCollisionVelocity(bubble1, bubble2)
{
    let normal = p5.Vector.sub(bubble2.location, bubble1.location);
    let distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius;

    if (distSquared > radiusAdded * radiusAdded)
        return;

    let dist = Math.sqrt(distSquared);

    if (dist != 0)
    {
        penetration = radiusAdded - dist;
        normal.normalize();
    }
    else
    {
        penetration = bubble1.radius;
        normal = createVector(1, 0);
    }

    let rv = p5.Vector.sub(bubble2.velocity, bubble1.velocity);
    let velAlongNormal = rv.dot(normal);

    if (velAlongNormal > 0)
        return;

    let j = -(1 + RESTITUTION) * velAlongNormal;
    j /= bubble1.invMass + bubble2.invMass;

    let impulse = p5.Vector.mult(normal, j);
    bubble1.velocity.sub(p5.Vector.div(impulse, bubble1.mass));
    bubble2.velocity.add(p5.Vector.div(impulse, bubble2.mass));
}

function correctPositions(bubble1, bubble2)
{
    let normal = p5.Vector.sub(bubble2.location, bubble1.location);
    let distSquared = normal.magSq(),
        radiusAdded = bubble1.radius + bubble2.radius;

    if (distSquared > radiusAdded * radiusAdded)
        return;

    let dist = Math.sqrt(distSquared);

    if (dist != 0)
    {
        penetration = radiusAdded - dist;
        normal.normalize();
    }
    else
    {
        penetration = bubble1.radius;
        normal = createVector(1, 0);
    }

    let percent = 0.9;
    let slop = 0.08;
    let correction = p5.Vector.mult(normal, percent * Math.max(penetration - slop, 0));
    bubble1.location.sub(p5.Vector.mult(correction, 0.5));
    bubble2.location.add(p5.Vector.mult(correction, 0.5));
}
function BubbleAnimation(radius)
{
    this.radius = radius;
    this.apparentRadius = radius;
    this.stroke = 10 * (this.apparentRadius / 100);
    this.constRadius = radius;
    this.expanding = false;
}

BubbleAnimation.prototype.update = function (deltaTime)
{
    this.radius = min(
        max(this.radius + (this.expanding ? 1 : -1) * deltaTime * 50, this.constRadius),
        this.constRadius + 10);
    this.apparentRadius = this.radius + (this.radius - this.constRadius) * 5;
    this.stroke = lerp(MAX_STROKE * (this.apparentRadius / (MAX_RADIUS + RADIUS_EXPAND)), HOVER_STROKE, this.percentOfFullSize());
}

BubbleAnimation.prototype.percentOfFullSize = function ()
{
    return (this.radius - this.constRadius) / RADIUS_EXPAND;
}

function Bubble(name, anime, radius, locX, locY, relativeScale, image)
{
    this.name = name;
    this.anime = anime;
    this.radius = radius;
    this.constRadius = radius;
    this.mass = radius * 1000;
    this.invMass = 1 / this.mass;
    this.location = createVector(locX, locY);
    this.velocity = createVector(0, 0);
    this.animation = new BubbleAnimation(radius);
    this.dragged = false;
    if (image)
    {
        let dim = min(image.width, image.height);
        this.image = image.get(0, 0, dim, dim);
        this.image.resize(MAX_RADIUS + RADIUS_EXPAND, MAX_RADIUS + RADIUS_EXPAND);
        this.image.mask(circleMask);
    }
    this.relativeScale = relativeScale;
}

Bubble.prototype.update = function ()
{
    // update animation stuff
    let hovered = p5.Vector.sub(this.location, createVector(mouseX, mouseY)).magSq() <= this.radius * this.radius;
    if (hovered) cursor(HAND);
    this.animation.expanding = (!bubbleGrabbed || this.dragged) && hovered;
    this.animation.update(FRAME_LEN);
    this.radius = this.animation.radius;
    if (!bubbleGrabbed && hovered && mouseIsPressed)
        this.dragged = bubbleGrabbed = true;
    else if (!bubbleGrabbed)
        this.dragged = false;

    // update physics stuff
    if (!this.dragged)
    {
        this.velocity.add(getGravVector(this.location));
        // if it's offscreen, disregard velocityFactor slowdown to give it an opportunity to enter screenspace
        if (onScreen(this.location, 0))
            this.velocity.mult(velocityFactor);
        this.location.add(p5.Vector.mult(this.velocity, FRAME_LEN));
    }
    else
        this.location = createVector(mouseX, mouseY);
}

Bubble.prototype.draw = function (ctx, batch)
{
    let imgDiameter = this.animation.apparentRadius * 2 - this.animation.stroke * 2;

    if (batch)
    {
        // draw white border
        ctx.noStroke();
        ctx.fill('white');
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2);

        // draw inner circle
        ctx.fill('#FEEAE0');
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
        if (this.image)
        {
            ctx.image(
                this.image,
                this.location.x,
                this.location.y,
                imgDiameter,
                imgDiameter
            );
        }
    }
    else
    {

        // draw white border
        ctx.push();
        ctx.noStroke();
        ctx.fill('white');
        ctx.drawingContext.shadowOffsetX = 2;
        ctx.drawingContext.shadowOffsetY = 2;
        ctx.drawingContext.shadowBlur = 8;
        ctx.drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2);
        ctx.pop();

        // draw inner circle
        ctx.push();
        ctx.noStroke();
        ctx.noFill();
        ctx.fill('#FEEAE0');
        ctx.ellipse(this.location.x, this.location.y, this.animation.apparentRadius * 2 - this.animation.stroke * 2);
        if (this.image)
        {
            ctx.image(
                this.image,
                this.location.x,
                this.location.y,
                imgDiameter,
                imgDiameter
            );
        }
        ctx.pop();
    }
}

Bubble.prototype.drawLabel = function (ctx)
{
    drawCurvedText(
    {
        str: this.name,
        radius: this.animation.apparentRadius - this.animation.stroke + (this.animation.stroke * lerp(0.2, 0.3, 1 - this.relativeScale)),
        scale: lerp(0.7, 0.8, this.relativeScale) * this.animation.stroke,
        x: this.location.x,
        y: this.location.y,
        offset: this.animation.expanding ? this.animation.percentOfFullSize() - 1 : 1 - this.animation.percentOfFullSize(),
        color: `rgba(0,0,0,${this.animation.percentOfFullSize()})`,
        ctx: ctx
    });
    drawCurvedText(
    {
        str: this.anime,
        radius: -(this.animation.apparentRadius - (this.animation.stroke * lerp(0.2, 0.3, 1 - this.relativeScale))),
        scale: lerp(0.7, 0.8, this.relativeScale) * this.animation.stroke,
        x: this.location.x,
        y: this.location.y,
        offset: this.animation.expanding ? this.animation.percentOfFullSize() - 1 : 1 - this.animation.percentOfFullSize(),
        color: `rgba(0,0,0,${this.animation.percentOfFullSize()})`,
        ctx: ctx,
        style: BOLD
    });
}

function getGravVector(curLoc)
{
    let gravVector;
    if (windowWidth > windowHeight)
    {
        const halfHeight = windowHeight / 2;
        let leftPoint = createVector(halfHeight, halfHeight),
            rightPoint = createVector(windowWidth - halfHeight, halfHeight);

        if (curLoc.x >= leftPoint.x && curLoc.x <= rightPoint.x)
            gravVector = createVector(0, halfHeight - curLoc.y);
        else
            gravVector = p5.Vector.sub((curLoc.x > rightPoint.x) ? rightPoint : leftPoint, curLoc);
    }
    else
    {
        const halfWidth = windowWidth / 2;
        let topPoint = createVector(halfWidth, halfWidth),
            bottomPoint = createVector(windowHeight - halfWidth, halfWidth);

        if (curLoc.y <= topPoint.y && curLoc.y >= bottomPoint.y)
            gravVector = createVector(0, halfWidth - curLoc.x);
        else
            gravVector = p5.Vector.sub((curLoc.y > bottomPoint.y) ? bottomPoint : topPoint, curLoc);
    }

    gravVector.normalize();
    gravVector.mult(FRAME_LEN * 1000);
    return gravVector;
}

function populateCharacterData(callback)
{
    let tops = [];
    loadTopAnime(tops, () =>
    {
        loadJSON("resources/json/test_va_response.json", json_response =>
        {
            let characters = createCharactersFromJSON(json_response, tops);
            console.log("Characters json!", characters.length);
            callback(characters);
        });
    });
//    return $.when(loadTopAnime(tops)).then(() =>
//    {
//        return $.getJSON("resources/json/test_va_response.json", json_response =>
//        {
//            characters.push(...createCharactersFromJSON(json_response, tops));
//            console.log("Characters json!", characters.length);
//        })
//    });
}

function loadTopAnime(tops, callback)
{
    console.log("Loading top animes...");
    let topPages = [
        "resources/json/test_top_1_response.json",
        "resources/json/test_top_2_response.json",
        "resources/json/test_top_3_response.json",
        "resources/json/test_top_4_response.json"
    ];
    
    loadTopPage(tops, topPages, topPages.length - 1, callback);
//
//    //https://stackoverflow.com/a/34489218
//    return $.when.apply($, $.map(topPages, page =>
//    {
//        return $.getJSON(page, json_response =>
//        {
//            addToTops(json_response, tops);
//        });
//    }));
}

function loadTopPage(tops, pages, i, callback)
{
    if (i == 0)
        loadJSON(pages[i], (json) =>
        {
            addToTops(json, tops);
            callback();
        });
    else
        loadJSON(pages[i], (json) =>
        {
            addToTops(json, tops);
            loadTopPage(tops, pages, --i, callback);
        });
}

function createCharactersFromJSON(json, tops)
{
    console.log("Received json! Creating characters...");
    let ids = [],
        characters = []
    for (const roles of json.voice_acting_roles)
    {
        // if character has appeared in a previous anime, skip
        let id = roles.character.mal_id;
        if (ids.includes(id)) continue;
        else ids.push(id);

        let name = roles.character.name;
        let commaIndex = name.search(', ');
        if (commaIndex != -1)
            name = `${name.substring(commaIndex + 2)} ${name.substring(0, commaIndex)}`;
        characters.push(
        {
            name: name,
            picURL: roles.character.image_url,
            animeID: roles.anime.mal_id,
            animeStr: roles.anime.name,
            rank: getRank(tops, roles.anime.mal_id)
        });
    }
    characters.sort((first, second) =>
    {
        return first.rank - second.rank;
    });
    console.log(`${characters.length} characters have been created`);
    return characters;
}

function addToTops(jsonTops, tops)
{
    for (const anime of jsonTops.top)
    {
        tops.push(
        {
            rank: anime.rank,
            mal_id: anime.mal_id
        });
    }
}

function getRank(tops, malID)
{
    let found;
    return (found = tops.find(anime =>
    {
        return anime.mal_id === malID;
    })) ? found.rank : Number.MAX_SAFE_INTEGER;
}

function update()
{
    addBubbles();
    slowdown();
    
    cursor(ARROW);

    for (const bubble of bubbles)
        bubble.update();

    for (let b1 = 0; b1 < bubbles.length - 1; b1++)
        for (let b2 = b1 + 1; b2 < bubbles.length; b2++)
            resolveCollisionVelocity(bubbles[b1], bubbles[b2]);

    for (let b1 = 0; b1 < bubbles.length - 1; b1++)
        for (let b2 = b1 + 1; b2 < bubbles.length; b2++)
            correctPositions(bubbles[b1], bubbles[b2]);
}

function render()
{
    background('#DADADA');


    buffer.clear();

    // used to order rendering, which is:
    // 1. non-expanding, background bubbles
    // 2. bubbles with text
    // 3. expanding, grabbed bubble
    let expandingBubble;
    let bubblesWithText = [];

    for (const bubble of bubbles)
    {
        if (bubble.animation.expanding)
            expandingBubble = bubble;
        else if (bubble.animation.radius != bubble.animation.constRadius)
            bubblesWithText.push(bubble);
        else
            bubble.draw(buffer, true);
    }

    push();
    /*    drawingContext.shadowOffsetX = 2;
        drawingContext.shadowOffsetY = 2;
        drawingContext.shadowBlur = 8;
        drawingContext.shadowColor = 'rgba(0,0,0,0.5)';*/
    image(buffer, 0, 0);
    pop();

    push();
    textAlign(CENTER, BASELINE);
    imageMode(CENTER);

    for (const bubble of bubblesWithText)
    {
        bubble.draw(this, false);
        bubble.drawLabel(this);
    }

    if (expandingBubble)
    {
        expandingBubble.draw(this, false);
        expandingBubble.drawLabel(this);
    }
    pop();
}

function addBubbles()
{
    if (bubbleQueue.length != bubbles.length
       && frameCount % INTRO_BUBBLE_EVERY_N_FRAME == 0)
            bubbles.push(bubbleQueue[bubbles.length]);
}

function slowdown()
{
    velocityFactor = max(velocityFactor *= velocityDecreaseRate, 0.5);

    if (frameCount == SLOWDOWN_AFTER_N_FRAMES)
    {
        console.log('Slowing down now');
        setTimeout(() =>
        {
            velocityDecreaseRate = 0.998;
        }, 2000);
    }
}
const FPS = 60,
    FRAME_LEN = 1 / FPS;
const INTRO_BUBBLE_EVERY_N_FRAME = 4;
const RESTITUTION = 0.1;

const MAX_RADIUS = 100;
const RADIUS_EXPAND = 10; // how much physical circle expands when hovered
const MAX_STROKE = 10; // stroke thickiness for largest circle
const HOVER_STROKE = 30; // actual stroke for when hovered
const MAX_BUBBLES = 55;
const SLOWDOWN_AFTER_N_FRAMES = Math.floor(MAX_BUBBLES / 20) * FPS;

let gravity;
let velocityFactor; // to prevent bubbles continuously moving after clumping together
let velocityDecreaseRate = 0.99995;

let bubbleCanvas;
let bubbleQueue = [];
let bubbles = [];
let font;
let bubbleGrabbed = false;
let circleMask;
let buffer;

//function preload()
//{
//    circleMask = createGraphics(200, 200);
//    circleMask.circle(100, 100, 200);
//    
//    createBubbles();
//}
//
//function setup()
//{
//    gravity = windowHeight;
//    velocityFactor = 1.0;
//
//    bubbleCanvas = createCanvas(windowWidth, windowHeight);
//    bubbleCanvas.parent('bubble-area');
//
//    frameRate(FPS);
//    buffer = createGraphics(windowWidth, windowHeight);
//    buffer.textAlign(CENTER, BASELINE);
//    buffer.imageMode(CENTER);
//    /* bubbleQueue.sort((first, second) =>
// {
//     return first.radius - second.radius;
// });*/
//}
//
//function draw()
//{
//    if (frameCount == 1)
//        console.log("First iteration!");
//    update();
//    render();
//}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
    buffer = createGraphics(windowWidth, windowHeight);
    buffer.textAlign(CENTER, BASELINE);
    buffer.imageMode(CENTER);
    gravity = windowHeight;
}

function mouseReleased()
{
    bubbleGrabbed = false;
}

function createBubbles()
{
    let createBubble = (characters, offset, img) =>
    {
        let offscreen = getOffscreenPoint(),
            scale = Math.pow((MAX_BUBBLES - offset) / MAX_BUBBLES, 2);
        bubbleQueue.push(new Bubble(characters[offset].name, characters[offset].animeStr, scale * 60 + 40, offscreen.x, offscreen.y, scale, img));
    };
    
    populateCharacterData((characters) =>
    {
        console.log("Creating characters", characters.length);
        for (let i = 0; i < MAX_BUBBLES; i++)
            (function (j)
            {
                if (!characters[j].picURL.includes("questionmark"))
                    loadImage(characters[j].picURL, img =>
                    {
                        createBubble(characters, j, img);
                        console.log("Created character", j);
                    });
                else
                    createBubble(characters, j);

            })(i);
    });
//    $.when(populateCharacterData(characters)).then(() =>
//    {
//        console.log("Creating characters", characters.length);
//        for (let i = 0; i < MAX_BUBBLES; i++)
//            (function (j)
//            {
//                if (!characters[j].picURL.includes("questionmark"))
//                    loadImage(characters[j].picURL, img =>
//                    {
//                        createBubble(j, img);
//                        console.log("Created character", j);
//                    });
//                else
//                    createBubble(j);
//
//            })(i);
//    });
}

function getOffscreenPoint()
{
    let point;
    do {
        point = createVector(Math.random() * (windowWidth + 1000) - 500, Math.random() * (windowHeight + 1000) - 500);
    }
    while (onScreen(point, 100));
    return point;
}

function onScreen(point, border)
{
    return point.x >= -border && point.x <= windowWidth + border &&
        point.y >= -border && point.y <= windowHeight + border;
}

/** str, radius, scale, x, y, offset, color, ctx **/
function drawCurvedText(textOpts)
{
    textOpts.ctx.textFont('Courier New', textOpts.scale);

    let arcLength = 0;
    let totalAngle = textOpts.ctx.textWidth(textOpts.str) / textOpts.radius;

    for (let i = 0; i < textOpts.str.length; i++)
    {
        let currentChar = textOpts.str.charAt(i);
        let w = textOpts.ctx.textWidth(currentChar);

        arcLength += w / 2;
        let theta = arcLength / textOpts.radius - totalAngle / 2 + textOpts.offset;

        textOpts.ctx.push();
        textOpts.ctx.fill(textOpts.color);
        textOpts.ctx.translate(textOpts.x, textOpts.y);
        textOpts.ctx.rotate(theta);
        textOpts.ctx.translate(0, -textOpts.radius);
        textOpts.ctx.textStyle(textOpts.style ? textOpts.style : NORMAL);
        textOpts.ctx.text(currentChar, 0, 0);
        textOpts.ctx.pop();

        arcLength += w / 2;
    }
}

function VoiceActor(name, picUrl) {
    
}