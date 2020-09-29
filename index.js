const canvas = document.getElementsByClassName("canvasd")[0];
const scel=document.querySelector('#score');//score element
const s_btn=document.querySelector('#startel');
const ui=document.querySelector('#all_ui');
const rescore=document.querySelector("#re_score");

const c = canvas.getContext('2d');



canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;

let center_x=canvas.width/2;
let center_y=canvas.height/2;


//  Projectile take (x,y,size,color)
class Player{
	constructor(x,y,radius,color){
		this.x = x;
		this.y = y;
		this.color = color;
		this.radius = radius;
	}
	draw(){
		c.beginPath();
		c.arc(this.x ,this.y ,this.radius ,0 ,Math.PI* 2,true);
		c.fillStyle=this.color;
		c.fill()
	}
}



//  Projectile take (x,y,size,color,velocity{x:num,y:num})
//                                          up: in num pute the same number
class Projectile{
	constructor(x,y,radius,color,velocity){
		this.x = x;
		this.y = y;
		this.color = color;
		this.radius = radius;
		this.velocity = velocity;
	}
	draw(){
		c.beginPath();
		c.arc(this.x ,this.y ,this.radius ,0 ,Math.PI* 2,true);
		c.fillStyle=this.color;
		c.fill()
	}
	update(){
		this.draw();
		this.x = this.x + (this.velocity.x*2);
		this.y = this.y + (this.velocity.y*2);
	}
}
class Enimy{
	constructor(x,y,radius,color,velocity){
		this.x = x;
		this.y = y;
		this.color = color;
		this.radius = radius;
		this.velocity = velocity;
	}
	draw(){
		c.beginPath();
		c.arc(this.x ,this.y ,this.radius ,0 ,Math.PI* 2,true);
		c.fillStyle=this.color;
		c.fill()
	}
	update(){
		this.draw();
		// console.log(this.velocity.x,this.velocity.y)
		this.x = this.x + (this.velocity.x*2);
		this.y = this.y + (this.velocity.y*2);
	}
}


const friction=0.99;
class Particle{
	constructor(x,y,radius,color,velocity){
		this.x = x;
		this.y = y;
		this.color = color;
		this.radius = radius;
		this.velocity = velocity;
		this.alpha=1;
	}
	draw(){
		c.save()
		c.globalAlpha=this.alpha;
		c.beginPath();
		c.arc(this.x ,this.y ,this.radius ,0 ,Math.PI* 2,true);
		c.fillStyle=this.color;
		c.fill()
		c.restore();
	}
	update(){
		this.draw();
		this.velocity.x*=friction;
		this.velocity.y*=friction;
		this.x = this.x + (this.velocity.x*2);
		this.y = this.y + (this.velocity.y*2);
		this.alpha-=0.01;
	}
}





let count = 3;
function spawnEnemies() {

	setInterval(()=> {
		for (var i = 0; i < count; i++) {
		
			const radius=Math.random()*(40-16)+16;
			let x;
			let y;
			if (Math.random()<0.5) {
				x=Math.random() < 0.5 ? 0-radius: canvas.width+radius;
				y=Math.random()*canvas.height;
			}else{
				y=Math.random() < 0.5 ? 0-radius: canvas.height+radius;
				x=Math.random()*canvas.width;
			}
			const color=`hsl(${Math.random()*360},50%,50%)`;
			const angle = Math.atan2(center_y-y,center_x-x);
			const velo = {
				x:Math.cos(angle),
				y:Math.sin(angle)
			}
			let enemy =new Enimy(x,y,radius,color,velo);
			enemies.push(enemy);
			}	
		}, 8000);
}







let player = new Player(center_x,center_y,10,'white');
let projectiles = [];
let enemies = [];
let particles = [];
let animationID;
let score=0;


function init() {
	player = new Player(center_x,center_y,10,'white');
	projectiles = [];
	enemies = [];
	particles = [];
	animationID=undefined;
	score=0;
	count=3;
	rescore.innerHTML='0';
	scel.innerHTML='0';
}


player.draw();

function animate() {
	animationID=requestAnimationFrame(animate);
	c.fillStyle='rgba(0,0,0,0.2)';
	c.fillRect(0, 0, canvas.width, canvas.height);
	player.draw();
	projectiles.forEach((bullet,index) => {
		bullet.update();
		//when bullet out of screen
		if (bullet.x+bullet.radius < 0||
			bullet.x-bullet.radius >canvas.width||
			bullet.y+bullet.radius < 0||
			bullet.y-bullet.radius >canvas.height
			) {
			setTimeout(() => {
				projectiles.splice(index,1);
			},0)
		}
	})

	particles.forEach((particle,ind) =>{
		if (particle.alpha<=0) {
			setTimeout(()=>{
				particles.splice(ind,1);
			},0)
		}else{
			particle.update();
		}
		
	})
	enemies.forEach((enemy,enindex) => {
		enemy.update();

		const distp =Math.hypot(player.x-enemy.x,player.y-enemy.y);
		//end game;
		//when enimy hit player
		if (distp - enemy.radius - player.radius < 1){
			cancelAnimationFrame(animationID);
			ui.style.display='flex';
			rescore.innerHTML=score;
			console.log("game over!")
		}

		//when projectile hit enemy
		projectiles.forEach((bullet,index) => {
			const dist =Math.hypot(enemy.x-bullet.x,enemy.y-bullet.y);   //hit enemy
			if (dist - enemy.radius - bullet.radius < 1) {
				//create explosions !
				score+=100;
				scel.innerHTML=score;
				for (var i = 0; i < enemy.radius*2; i++) {
					particles.push(new Particle(bullet.x,bullet.y,
						Math.random()*2,enemy.color,
						{
						x:(Math.random()-0.5)*(Math.random()*8), 
						y:(Math.random()-0.5)*(Math.random()*8)
					}))
				}

				//if enemy big enaf dont distroy it but shrink it
				if (enemy.radius>20) {
					// shrink animation
					gsap.to(enemy,{radius:enemy.radius-10});
					setTimeout(()=>{
						score+=100;
						scel.innerHTML=score;
						projectiles.splice(index,1);
						particles.splice(index,1);
					},0)
				}else{
					setTimeout(()=>{
						
						count+=1;
						
						
						score+=250;
						console.log(count)
						scel.innerHTML=score;
						projectiles.splice(index,1);
						enemies.splice(enindex,1);
						// console.log("else");
					},0)
				}
			}
		});
	})
}






addEventListener('click',(e) => {
	const angle = Math.atan2(e.clientY-center_y,e.clientX-center_x)
	const velo = {
		x:Math.cos(angle)*4,
		y:Math.sin(angle)*4
	}

	let projectile=new Projectile(center_x,center_y,5,'white',velo);
	projectiles.push(projectile);
	// console.log(projectiles)
})



let cl=0;
s_btn.addEventListener('click',()=> {
	ui.style.display='none';
	cl+=1
	if (cl>0) {
		s_btn.innerHTML="Restart"
	}
	init();
	animate();
	spawnEnemies();
})





// fromTo
