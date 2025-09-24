var canvas = document.querySelector('canvas');

canvas.width =  900;
canvas.height = 900;

var c = canvas.getContext('2d');

var mouse = {
    x:undefined,
    y:undefined
}

var colorArray= 
[
    '#ffaa33',
    '#99ffaa',
    '#00ff00',
    '#4411aa',
    '#ff1100'
];

function randomIntFromRange(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function randomColor(colors)
{
    return colors[Math.floor(Math.random()*colors.length)];
}
window.addEventListener('mousemove', function(event)
{
    mouse.x = event.x;
    mouse.y = event.y;
})


function iha(id,x,y,z,klavuz)  {
    this.id = id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.z = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.size = 20;
    this.yaw =0;
    this.dX =0;
    this.dY =0;
    this.hedef =undefined;
    this.isKlavuz = klavuz;
    this.path = [];

    this.draw = function()
    {
        c.beginPath();
        c.fillStyle = "#0000FF";
        c.fillRect(this.x, this.y, this.size, this.size,);
        c.stroke();
        c.closePath();

        var pointer = 15;
        c.beginPath();
        c.fillStyle = "#FF0000";
        c.fillRect(this.x +this.size/2 - this.size/4 +  ((pointer)*Math.sin(-(this.yaw-135)*Math.PI/180) + (pointer)*Math.cos((this.yaw-135)*Math.PI/180)) , 
                   this.y +this.size/2 - this.size/4 +  ((pointer)*Math.cos(-(this.yaw-135)*Math.PI/180) + (pointer)*Math.sin((this.yaw-135)*Math.PI/180)) , 
                   this.size/2, 
                   this.size/2);
        c.stroke();
        c.closePath();
    }

    this.update = function()
    {

        
        this.dX = this.xSpeed*Math.sin(-this.yaw*Math.PI/180) + this.ySpeed*Math.cos(this.yaw*Math.PI/180);
        this.dY = this.xSpeed*Math.cos(-this.yaw*Math.PI/180) + this.ySpeed*Math.sin(this.yaw*Math.PI/180);

        this.x -= this.dX;
        this.y -= this.dY;
        this.draw();
    }
    return this;
}

function point(x,y,z,size) 
{
    this.x =x;
    this.y =y; 
    this.z =z;
    this.size=size;
    this.neighbors = [];
    this.cameFrom = undefined;
    this.fScore=0;
    this.gScore=0;
    this.hScore=0;

    this.addNeighbors = function()
    {

        this.neighbors.push(new point(this.x+resFact,this.y        ,this.z,this.size))
        this.neighbors.push(new point(this.x-resFact,this.y        ,this.z,this.size))
        this.neighbors.push(new point(this.x+resFact,this.y-resFact,this.z,this.size))
        this.neighbors.push(new point(this.x+resFact,this.y+resFact,this.z,this.size))

        this.neighbors.push(new point(this.x-resFact,this.y-resFact,this.z,this.size))
        this.neighbors.push(new point(this.x-resFact,this.y+resFact,this.z,this.size))
        this.neighbors.push(new point(this.x        ,this.y-resFact,this.z,this.size))
        this.neighbors.push(new point(this.x        ,this.y+resFact,this.z,this.size))
    }
    return this;
}


var xMove = 0;
var yMove = 0;
var speed = 15;

var ihalar   = [new iha(2,200,100,0,false)   ,new iha(1,300,100,0,false)   ,new iha(3,400,100,0,false) , new iha(2,500,100,0,false)   ,new iha(1,600,100,0,false)]
var klavuzIha = new iha(2,450,450,true);

var resFact = 20; // Resolation Factor = Oluşturulacak noktarlar artasındaki mesafe  
var yakinlikTH = 10;

var obstacles =[new point(300,400,0,50),new point(250,400,0,50),new point(200,400,0,50),new point(350,400,0,50),new point(400,400,0,50),
                    new point(450,400,0,50),new point(450,350,0,50),new point(450,300,0,50),new point(450,250,0,50)]


document.addEventListener('keydown', logKey);
function logKey(e)
{
    switch(e.keyCode)
    {
        case 68 : klavuzIha.x++;break;
        case 65 : klavuzIha.x--;break;
        case 87 : klavuzIha.y--;break;
        case 83 : klavuzIha.y++;break;
    }
    //console.log(e.keyCode)  // D = 68 , A = 65 , W = 87 , S = 83
}


function animate()
{
    requestAnimationFrame(animate)
    c.clearRect(0,0,innerWidth,innerHeight);
    noktalar = getFormasyon(klavuzIha, ihalar , "arrow")
    //  noktalar = getFormasyon(klavuzIha, ihalar , "prisma")
    
    ihalar = enKisaYol(ihalar, noktalar); 




    ihalar.forEach(iha0 => {
        iha0.path = pathFinding(iha0 , iha0.hedef , 1);


        if(iha0.path.length>0)
        {
            move(iha0 , klavuzIha.yaw , iha0.hedef.z)
        }
        else if  (paths.length==0) move(iha0,klavuzIha.yaw , iha0.hedef.z);

    });
    
    
    obstacles.forEach(obstaclePoint => 
        {
            c.beginPath();
            c.fillStyle = "#000000";
            c.fillRect(obstaclePoint.x, obstaclePoint.y, obstaclePoint.size, obstaclePoint.size);
            c.stroke();
            c.closePath();
        });
        c.beginPath();
        c.fillStyle = "#000000";
        c.fillRect(klavuzIha.x, klavuzIha.y, klavuzIha.size, klavuzIha.size);
        c.stroke();
        c.closePath(); 
}

animate();


function move(iha,yaw)
{
    bitis = iha.hedef;
    paths = iha.path;
    if(paths.length>1)
    {
        deltaX = (paths[paths.length-2].x-iha.x);
        deltaY = (paths[paths.length-2].y-iha.y);
        iha.z = paths[paths.length-2].z;
    }
    else
    {
        deltaX = (paths[paths.length-1].x-iha.x);
        deltaY = (paths[paths.length-1].y-iha.y);
        iha.z = paths[paths.length-1].z
    }
    mesafeMove =  Math.sqrt(deltaX*deltaX + deltaY*deltaY)
    //console.log(mesafeMove)
    needYaw = hedefeBak( deltaX, deltaY);

    deltaX1 = (bitis.x-iha.x);
    deltaY2 = (bitis.y-iha.y);
    iha.yaw = yaw//hedefeBak( deltaX1, deltaY2);
    if(mesafeMove <= 0.001) 
    {   
        //console.log("test1")
        iha.xSpeed = 0;
        iha.ySpeed = 0;
    }
    else if(mesafeMove<yakinlikTH)
    {
        //console.log("test2")
        iha.xSpeed = speed*(mesafeMove/yakinlikTH/2)*Math.cos((needYaw-iha.yaw)/180*Math.PI);
        iha.ySpeed = -speed*(mesafeMove/yakinlikTH/2)*Math.sin((needYaw-iha.yaw)/180*Math.PI);
    }
    else 
    {
        //console.log("test3")
        iha.xSpeed = speed*Math.cos((needYaw-iha.yaw)/180*Math.PI);
        iha.ySpeed = -speed*Math.sin((needYaw-iha.yaw)/180*Math.PI);
    }
    iha.update();
}


function hedefeBak(deltaX , deltaY)
{   
    if(deltaX==0 && deltaY==0){}
    else
    {
        var olcum1 = Math.atan(deltaY/deltaX)/Math.PI*180 + 90;
        if(deltaX<=0)
        {
            sonuc =  180+olcum1;
        }
        else
        {
            sonuc = olcum1;
        }
    }
    return sonuc;
}
   
var openSet = [];
var closedSet = [];
function pathFinding(iha , endPoint , h)
{
    
    openSet = [];
    closedSet = [];
    startPoint = new point (iha.x,iha.y,1);
    openSet.push(startPoint);
    while(openSet.length>0)
    {
        console.log(openSet.length)
        if(openSet.length>200)
        {
            console.log("sikerler")
            break;
        }
        var winner = 0;
        for(var i=0;i<openSet.length;i++){
            if(openSet[i].fScore < openSet[winner].fScore){
                winner=i;
            }
        }
        var current = openSet[winner];

        if(mesafe(current,endPoint)<resFact)
        {
            
            path = [];
            var temp = current;
            path.push(endPoint)
            //path.push(temp)
            while(temp.cameFrom){
                path.push(temp.cameFrom);
                temp = temp.cameFrom;
            }
            return path;
        }

       
        removeFromeArray(openSet, current)
        closedSet.push(current);
        current.addNeighbors();
        var neighbors = current.neighbors;
        for(var i=0;i < neighbors.length;i++)
        {
            neighbor = neighbors[i] 

            isInClosedSet = false;
            closedSet.forEach(element => {
                if(mesafe(element,neighbor)<=resFact)
                {
                    isInClosedSet=true;
                }
            });
            if(!isInClosedSet)
            {
                
                var tempG = current.gScore + mesafe(neighbor,current);            
                isInOpenSet = false;
                openSet.forEach(element => {
                    if(mesafe(element,neighbor)<=resFact)
                    {
                        isInOpenSet=true;
                    }
                });
                isObstacles = false;
                obstacles.forEach(element => {
                    if(mesafe(element,neighbor)<=element.size*1.1)
                    {
                        isObstacles=true;
                    }
                });                
                ihalar.forEach(element => {
                    if(mesafe(element,neighbor)<=element.size*1.1)
                    {
                        isObstacles=true;
                    }
                });  
                if(mesafe(klavuzIha,neighbor)<=klavuzIha.size*1.1)
                {
                    if(Math.abs(klavuzIha.z-neighbor.z)<=klavuzIha.size*1.1)
                        isObstacles=true;
                }
                if(!isObstacles)
                {
                    if(isInOpenSet)
                    {
                        if(tempG < neighbor.gScore)neighbor.gScore=tempG;
                    }else
                    {
                        neighbor.gScore = tempG;
                        openSet.push(neighbor);
                    }
                    neighbor.hScore = mesafe(neighbor,endPoint);
                    neighbor.fScore = neighbor.gScore + neighbor.hScore;
                    neighbor.cameFrom = current;
                }
            }
            
        }
        
    }
    return [];
}

function removeFromeArray(arr,elt)
{
    for(var i = arr.length -1; i>=0;i--){
        if(arr[i] == elt){
            arr.splice(i,1);
            break;
        }
    }
}

function enKisaYol(ihalar , hedefler)
{
    bitmisHedefler = [];
    for(var i =0;ihalar.length>i;i++)
    {
        enYakinNokta = {nokta:undefined,uzaklik:Infinity,id:-1}
        for(var j =0;hedefler.length>j;j++)
        {
            if(!hedefler[j].occupied)
            {
                msf = mesafe(ihalar[i],hedefler[j])
                if(enYakinNokta.uzaklik>msf) 
                {

                    enYakinNokta.nokta = hedefler[j]
                    enYakinNokta.uzaklik =msf;
                    enYakinNokta.id= j;
                }
            }

        }
        ihalar[i].hedef = enYakinNokta.nokta;
        if(enYakinNokta.id != -1)
        {
            hedefler[enYakinNokta.id].occupied = true;
        }
    }
    return ihalar;
}

function enKisaToplamYol(ihalar)
{
    for(var i = 0;ihalar.length>i;i++)
    {
        for(var j = 0;ihalar.length>j;j++)
        {
            if(i != j)
            {

                var mesafeler1 = mesafe(ihalar[i], ihalar[i].hedef)
                var mesafeler2 = mesafe(ihalar[j], ihalar[j].hedef)

                var mesafelerA = mesafeler1 + mesafeler2;

                var mesafeler3 = mesafe(ihalar[i], ihalar[j].hedef)
                var mesafeler4 = mesafe(ihalar[j], ihalar[i].hedef)

                var mesafelerB = mesafeler3 + mesafeler4;

                if(mesafelerA > mesafelerB)
                {
                    gHedef = ihalar[j].hedef;
                    ihalar[j].hedef = ihalar[i].hedef;
                    ihalar[i].hedef = gHedef;
                }
            }
        }
    }
    return ihalar;
}


function toplamMesafe(ihalar)
{
    toplam=0;

    for(var i =0;ihalar.length>i;i++)
    {
        toplam += mesafe(ihalar[i].hedef,ihalar[i])
    }
    return toplam;
}


function bubbleSort(arr){
    var len = arr.length;
    for (var i = len-1; i>=0; i--){
      for(var j = 1; j<=i; j++){
        if(arr[j-1]>arr[j]){
            var temp = arr[j-1];
            arr[j-1] = arr[j];
            arr[j] = temp;
         }
      }
    }
    return arr;
 }

function isIntersecting(pnt, obst)
{
    isInter =false;
    obst.forEach(obstacle => {
        if(mesafe(obstacle,pnt)<obstacle.size+resFact/5)isInter=true;
    });
    return isInter;
}

function mesafe(poin1,poin2)
{
    deltaX = (poin1.x-poin2.x);
    deltaY = (poin1.y-poin2.y);
    msf =  Math.sqrt(deltaX*deltaX + deltaY*deltaY)
    return msf;
}

function drawinReq(Nokta,col)
{
    c.beginPath();
    c.fillStyle = col;
    c.fillRect(Nokta.x, Nokta.y, Nokta.size, Nokta.size);
    c.stroke();
    c.closePath();
}




function getFormasyon(kilavuz, ihalar  , type)
{
    formasyon = []
    if(type == "arrow")
    {
        formasyon = formasyonArrow(kilavuz, ihalar);
    }
    else if(type == "prisma")
    {
        formasyon = formasyonPrisma(kilavuz, ihalar)
    }

    return formasyon;
}



function formasyonArrow(kilavuz, ihalar)
{   
    var ihalength = ihalar.length;
    var u_b = 100;
    var a_b = 45;
    var u_k = 100;
    var a_k = kilavuz.yaw;
    formasyon = []
    for(var i=0;ihalength>i;i++)
    {
        if(i%2==0)
        {
            x = klavuzIha.x+u_k*Math.sin((-a_k)/180*Math.PI) + u_b*i*Math.sin((0-a_k-a_b)/180*Math.PI);
            y = klavuzIha.y+u_k*Math.cos((-a_k)/180*Math.PI) + u_b*i*Math.cos((0-a_k-a_b)/180*Math.PI);
            z = klavuzIha.z;
            formasyon.push(new point(x, y , z ,1))
        }
        else if(i%2==1)
        {
            x = klavuzIha.x+u_k*Math.sin((-a_k)/180*Math.PI) + u_b*(i+1)*Math.sin((0-a_k+a_b)/180*Math.PI);
            y = klavuzIha.y+u_k*Math.cos((-a_k)/180*Math.PI) + u_b*(i+1)*Math.cos((0-a_k+a_b)/180*Math.PI);
            z = klavuzIha.z;
            formasyon.push(new point(x, y , z ,1))
        }
    }

    return formasyon;
}   


function formasyonPrisma(kilavuz, ihalar)
{
    var ihalength = ihalar.length;
    var u_b = 100;
    var u_k = 100;
    var a_k = kilavuz.yaw;
    formasyon = []

    x = klavuzIha.x+u_k*Math.sin((-a_k)/180*Math.PI);
    y = klavuzIha.y+u_k*Math.cos((-a_k)/180*Math.PI);
    z = klavuzIha.z;
    formasyon.push(new point(x, y , z ,1))

    for(var i=0;ihalength-1>i;i++)
    {
        gX = klavuzIha.x+u_k*Math.sin((-a_k)/180*Math.PI) + u_b*Math.sin((-a_k)/180*Math.PI);
        gY = klavuzIha.y+u_k*Math.cos((-a_k)/180*Math.PI) + u_b*Math.cos((-a_k)/180*Math.PI);
        if(i%4==0)
        {
            x = gX + u_b/2*Math.sin((0-a_k-90)/180*Math.PI) +(i)/4*u_b*Math.sin((-a_k)/180*Math.PI);
            y = gY + u_b/2*Math.cos((0-a_k-90)/180*Math.PI) +(i)/4*u_b*Math.cos((-a_k)/180*Math.PI);
            z = klavuzIha.z + u_b/2;
            formasyon.push(new point(x, y , z ,1))
        }
        else if(i%4==1)
        {
            x = gX + u_b/2*Math.sin((0-a_k+90)/180*Math.PI) +(i-1)/4*u_b*Math.sin((-a_k)/180*Math.PI);
            y = gY + u_b/2*Math.cos((0-a_k+90)/180*Math.PI) +(i-1)/4*u_b*Math.cos((-a_k)/180*Math.PI);
            z = klavuzIha.z + u_b/2;
            formasyon.push(new point(x, y , z ,1))
        }
        else if(i%4==2)
        {
            x = gX + u_b/2*Math.sin((0-a_k-90)/180*Math.PI) +(i-2)/4*u_b*Math.sin((-a_k)/180*Math.PI);
            y = gY + u_b/2*Math.cos((0-a_k-90)/180*Math.PI) +(i-2)/4*u_b*Math.cos((-a_k)/180*Math.PI);
            z = klavuzIha.z - u_b/2;
            formasyon.push(new point(x, y , z ,1))

        }
        else if(i%4==3)
        {
            x = gX + u_b/2*Math.sin((0-a_k+90)/180*Math.PI) +(i-3)/4*u_b*Math.sin((-a_k)/180*Math.PI);
            y = gY + u_b/2*Math.cos((0-a_k+90)/180*Math.PI) +(i-3)/4*u_b*Math.cos((-a_k)/180*Math.PI);
            z = klavuzIha.z - u_b/2;
            formasyon.push(new point(x, y , z ,1))
        }

    }
    return formasyon; 
}
