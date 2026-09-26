(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`pico-8 cartridge // http://www.pico-8.com
version 42
__lua__
-- ★ aSCENT ★
-- BY @jOHANpEITZ
-- AUDIO BY @vAVmUSICmAGIC
-- FOR lOWrEZ jAM 2022

-- ★ CHANGELOG V1.1 (POST JAM)
-- added more particles here and there
-- added additional ending
-- tweaked existing ending
-- changed dash to be 0G
-- changed some texts
-- adjusted tiles at several places to read better
-- fixed typos

-- ★ CHANGELOG V1.0 (JAM VERSION)
-- all the things


-- debug=true
function _init()
	-- go into 64x64
	poke(0x5f2c, 3)
	poke(0x5f2c, 3)
	
 -- keep palette 
 poke(0x5f2e,1)
 reset_pal()

 -- font
 poke(0x5600,unpack(split"6,8,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,63,63,63,63,63,63,0,0,0,63,63,63,0,0,0,0,0,63,51,63,0,0,0,0,0,51,12,51,0,0,0,0,0,51,0,51,0,0,0,0,0,51,51,51,0,0,0,0,48,60,63,60,48,0,0,0,3,15,63,15,3,0,0,62,6,6,6,6,0,0,0,0,0,48,48,48,48,62,0,99,54,28,62,8,62,8,0,0,0,0,24,0,0,0,0,0,0,0,0,0,12,24,0,0,0,0,0,0,12,12,0,0,0,10,10,0,0,0,0,0,4,10,4,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,5,5,0,0,0,0,0,0,0,0,1,0,0,0,0,0,14,17,21,17,14,0,0,0,1,4,2,1,4,0,0,0,0,5,7,2,0,0,0,0,1,1,0,0,0,0,0,0,2,1,1,1,2,0,0,0,1,2,2,2,1,0,0,0,0,5,2,5,0,0,0,0,0,2,7,2,0,0,0,0,0,0,0,0,1,1,0,0,0,0,7,0,0,0,0,0,0,0,0,0,1,0,0,0,4,4,2,2,1,1,0,0,2,5,5,5,2,0,0,0,2,3,2,2,2,0,0,0,3,4,2,1,7,0,0,0,3,4,2,4,3,0,0,0,5,5,7,4,4,0,0,0,7,1,3,4,3,0,0,0,2,1,3,5,2,0,0,0,7,4,4,2,2,0,0,0,2,5,2,5,2,0,0,0,2,5,6,4,2,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,1,0,0,4,2,1,2,4,0,0,0,0,7,0,7,0,0,0,0,1,2,4,2,1,0,0,0,3,4,2,0,2,0,0,0,2,5,5,1,6,0,0,0,0,6,5,5,6,0,0,0,1,3,5,5,3,0,0,0,0,6,1,1,6,0,0,0,4,6,5,5,6,0,0,0,0,2,7,1,2,0,0,0,2,1,1,3,1,1,0,0,0,6,5,7,4,3,0,0,1,3,5,5,5,0,0,0,1,0,1,1,1,0,0,0,2,0,2,2,2,1,0,0,1,5,3,5,5,0,0,0,1,1,1,1,1,0,0,0,0,15,21,21,21,0,0,0,0,3,5,5,5,0,0,0,0,2,5,5,2,0,0,0,0,3,5,5,3,1,0,0,0,6,5,5,6,4,0,0,0,5,3,1,1,0,0,0,0,3,1,2,3,0,0,0,1,3,1,1,2,0,0,0,0,5,5,5,6,0,0,0,0,5,5,5,2,0,0,0,0,17,21,21,10,0,0,0,0,5,2,2,5,0,0,0,0,5,5,6,4,3,0,0,0,15,4,2,15,0,0,0,3,1,1,1,3,0,0,0,1,1,2,2,4,4,0,0,3,2,2,2,3,0,0,0,2,5,0,0,0,0,0,0,0,0,0,0,7,0,0,0,1,2,0,0,0,0,0,0,2,5,5,7,5,0,0,0,3,5,3,5,3,0,0,0,6,1,1,1,6,0,0,0,3,5,5,5,3,0,0,0,7,1,3,1,7,0,0,0,7,1,1,3,1,0,0,0,6,1,1,5,6,0,0,0,5,5,7,5,5,0,0,0,1,1,1,1,1,0,0,0,2,2,2,2,2,1,0,0,5,5,3,5,5,0,0,0,1,1,1,1,7,0,0,0,17,27,21,17,17,0,0,0,3,5,5,5,5,0,0,0,2,5,5,5,2,0,0,0,3,5,5,3,1,0,0,0,2,5,5,5,2,4,0,0,3,5,5,3,5,0,0,0,6,1,2,4,3,0,0,0,7,2,2,2,2,0,0,0,5,5,5,5,6,0,0,0,5,5,5,5,2,0,0,0,17,17,21,27,17,0,0,0,5,5,2,5,5,0,0,0,5,5,5,6,4,2,0,0,7,4,2,1,7,0,0,0,2,2,2,7,2,0,0,0,1,1,1,1,1,1,0,0,0,7,7,7,2,0,0,0,5,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,127,127,127,127,127,127,127,0,85,42,85,42,85,42,85,0,65,99,127,93,93,119,62,0,62,99,99,119,62,65,62,0,17,68,17,68,17,68,17,0,4,12,124,62,31,24,16,0,28,38,95,95,127,62,28,0,34,119,127,127,62,28,8,0,42,28,54,119,54,28,42,0,62,15,15,6,0,0,0,0,8,28,62,127,62,42,58,0,62,103,99,103,62,65,62,0,62,127,93,93,127,99,62,0,24,120,8,8,8,15,7,0,62,99,107,99,62,65,62,0,8,20,42,93,42,20,8,0,0,0,0,85,0,0,0,0,62,115,99,115,62,65,62,0,8,28,127,28,54,34,0,0,127,34,20,8,20,34,127,0,62,119,99,99,62,65,62,0,0,10,4,0,80,32,0,0,17,42,68,0,17,42,68,0,62,107,119,107,62,65,62,0,127,0,127,0,127,0,127,0,85,85,85,85,85,85,85,0")) 
 poke(0x5f58,0x81)

 -- kerning
 kerning={}
 local kdata=split"(=1,)=1,Z=-1,j=1,J=1,.=2,w=-2,W=-2,m=-2,M=-2,S=1,W=-2,'=2,T=1,I=2, =2,i=2,L=2,F=1,➡️=-4,⬅️=-4,⬆️=-4,⬇️=-4,🅾️=-4,❎=-4,:=2"
 for pair in all(kdata) do
  local kv=split(pair,"=")
  kerning[kv[1]]=kv[2]
 end  
 
 fade_progress=1
 fade_pal={
	 0,0,1,14,
	 2,1,13,6,
	 4,4,9,15,
	 13,5,1,3
 }

 particles1={}
 particles2={}
 entities={}
 
 tips={}
 
 -- scan map
 rooms={}
 for ry=0,3 do
  for rx=0,15 do
   rooms[rx+ry*16]={}
   local r=rooms[rx+ry*16]
   for tx=0,7 do
    for ty=0,7 do
     local x=rx*8+tx
     local y=ry*8+ty
     local ▒=mget(x,y)
     local e=parse_tile(▒,x,y)
     if e and ▒!=64 then
      add(r,{▒=▒,x=x,y=y})
      del(entities,e)
     end
    end
   end
  end
 end
 
 -- timer
 ticks=0
 lore_count=0
   
 -- put player on top
 add(entities,del(entities,pl))
 -- start collapsed
 pl.state=2
 pl.collapsed_cooldown=60
 set_anim(pl,{71})
 pl.fs=40
 
 -- camera
 shakex,shakey=0,0
 set_cam(64*(pl.x\\64),64*(pl.y\\64))

end

function parse_tile(▒,x,y)
 if ▒==64 then
  pl=make_player(x*8+4,y*8+5) 
  mset(x,y,0)
 end
 if ▒==183 then
  make_outro(x*8+4,y*8+4) .on_draw=nil 
  mset(x,y,0)
 end
 if ▒==94 then
  make_fan(x*8+4,y*8+4).on_draw=nil 
  mset(x,y,0)
 end
 if ▒==121 then
  make_lorb(x*8+4,y*8+4) 
  mset(x,y,0)
 end
 if ▒==116 then
  mset(x,y,0)
  make_vines(x*8+4,y*8+4) 
 end
 if ▒==80 then
  mset(x,y,0)
  return make_blob(x*8+4,y*8+6) 
 end
 if ▒==197 then
  mset(x,y,0)
  make_twinkle(x*8+4,y*8+4) 
 end
 if ▒==88 then
  mset(x,y,0)
  make_mushroom(x*8+4,y*8+4) 
 end
 if ▒==96 then
  mset(x,y,0)
  make_checkpoint(x*8+4,y*8+4) 
 end
 if ▒==98 then
  mset(x,y,0)
  return make_bearpig(x*8+4,y*8+4) 
 end
 if ▒==145 then
  make_upgrader(x*8+4,y*8+7) 
 end
 if ▒==148 then
  make_pod(x*8+4,y*8+7) 
 end

 ⧗=0
 intro=20

end

function swap_room(rx,ry)
 -- remove olds
 for e in all(room_entities) do
  del(entities,e)
 end

 -- add news
 local r=rooms[rx+ry*16]
 room_entities={}
 for e in all(r) do
  local ee=parse_tile(e.▒,e.x,e.y)
  if (ee) add(room_entities,ee)
 end
end

function set_cam(cx,cy)
 camtx,camty=cx,cy
 camx,camy=camtx,camty
end


function speak(lines)
 speech_page=1
 speech=lines
end

function _update()
 ⧗+=1
 if ⧗>32000 then
  ⧗-=32000
 end
 
 -- handle speech bubble
 if lore_count>0 and lore_count<100 then
  lore_count+=1
 end
 
-- if (btnp(3,1)) debug=not debug
	
 if fade_progress>0 then
  fade_progress-=0.075
 end	
	
	if camx==camtx and camy==camty then
	 update_particles(particles1)
	 update_particles(particles2)
	
	 if speech then
	  if btnp(❎) then
	   sfx(52)
		  speech_page+=1
		  if speech_page>#speech then
		   speech=nil
		   lore_reply=nil
		  end
		 end
	 elseif active_lore then
	  if btnp(❎) then
	   sfx(52)
	   active_lore=false
   end
	 else
	 
	  if intro<0 and ⧗%30==0 and not outro then
 	  ticks+=1
	  end
	   
			if outro then
		  update_outro()
		 else
			 get_input(pl)
		 end
		 	
			for e in all(entities) do
		  e.on_update(e)
		 end
		 
		 for e in all(entities) do
		  if e.on_hit_player then
		   if aabb(e,pl) then
		    e.on_hit_player(e)
		   end
		  end
		 end
		end
 
 end

 local ocx,ocy=camtx,camty

 camtx=min(960,max(0,64*(pl.x\\64)))
 camty=min(192,max(0,64*(pl.y\\64)))
 camx+=4*ssgn(camtx-camx)
 camy+=4*ssgn(camty-camy)
 
 if ocx!=camtx or ocy!=camty then
  swap_room(camtx\\64,camty\\64)
 end
 
 if intro!=20 and intro>-32 then
  intro-=1
 end
 
 if intro==20 and btnp(🅾️) then
  set_anim(pl,{71,72})
  pl.fs=60
  intro=19
  music(0)
 end

 -- desert storm 
 for i=1,4 do
	 spawn_sand(
	  -1,192+rnd(48)+24,
	  rnd(3)+1
	 )
 end
 
end


function _draw()
 cls()
 
 -- fancy bg effects 
 if outro_step==2 then
  local cols=split"0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1"
  local c=cols[outro%#cols+1]
  cls(c)
 elseif outro_step==3 then
  local cols={7,6,12,13,12,6,7}
  local c=cols[outro%#cols+1]
  cls(c)
 end
 
 -- show last screen 
 if outro_step==5 then
  prc("sPIRITS SAVED",32,10,12,5)
  prc(pl.lore.."/8", 32, 18, 12,5)

	 prc("tIME PLAYED",32,30,12,5)
	 local mins=ticks\\60
	 local secs=ticks-mins*60
	 prc(mins..":"..(secs>9 and "" or "0")..secs,32,38,12,5)

  prc("tHANKS FOR PLAYING",32,50,7,13)
 else
	 -- render game 
	 
	 -- override some stuff

	 camera(camx+shakex,camy+shakey)
		shakex,shakey=0,0
			
		if not debug then
	 	map()
		else
		 -- debug map (flags)
		 local tx,ty=camx\\8,camy\\8
		 for y=0,7 do
	 	 for x=0,7 do
		   local tile=mget(tx+x,ty+y)
		   local flag=fget(tile)
		   if flag>0 then
	 	   local px,py=x*8+camx,y*8+camy
		    rect(px,py,px+7,py+7,flag+7)
		   end
		  end
		 end
		end
		
		-- particles
	 for p in all(particles1) do
	  if (p.on_draw) p.on_draw(p) 
	 end
	 
	 -- entities
	 for e in all(entities) do
	  if (e.on_draw) e.on_draw(e)
	 end
	
	 for p in all(particles2) do
	  if (p.on_draw) p.on_draw(p) 
	 end
	
	 
	 -- hud
	 camera()
	 
	 if speech then
	  local txt=speech[speech_page]
	  local w,h=tlen(txt)
	  local x=max(2,min(58-w,pl.x-w/2-camx))
	  local y=max(2,pl.y-h*8-16-camy)
	  rectfill(x,y-1,x+w,y+h*5+3,7)
	  rectfill(x-1,y,x+w+1,y+h*5+2,7)
	  local cx,cy=x+w/4,y
	  for i=-6,6 do  
	   line(pl.x-3-camx,pl.y-8-camy,cx+i,y,7)
	  end
	  pr(txt,x+1,y,1,6)
	  
	  spr(126+sin(t()),x+w,y+h*5-1)
	 end 
	 
	 if active_lore then
	  local loreid=pl.lore
	  if (outro_step==2) loreid=9
	  if (outro_step==4) loreid=pl.lore==8 and 12 or 10
	  if (outro_step==2.5) loreid=11
	  draw_lore(loreid)
	 end
	 
	
	 -- debug
	 if debug then
	  local mins=ticks\\60
	  local secs=ticks-mins*60
	  pr(mins..":"..(secs>9 and "" or "0")..secs,1,1,7)
	 end
	 
	 if intro>-30 then
	  spr(187,12,intro,5,1)
	  
	  local page=⧗%200
	  if page<50 then
	   pr("pEITZ",39,76-intro,14) 
	   pr("BY jOHAN pEITZ",8,77-intro,4,1) 
	  elseif page<100 then
	   pr("(Z) TO START",12,77-intro,6,1) 
	  elseif page<150 then
	   pr("aUDIO BY vAV",10,77-intro,4,1) 
	  elseif page<200 then
	   pr("(Z) TO START",12,77-intro,6,1) 
	  end
	 end
 end
 
 update_fade()
 
-- if (not debug) print(outro,1,1,8)
end

-->8
-- helpers

function _mget(x,y)
 if (y<0 or y>31) return 0
 return mget(x,y)
end

function add_params(src,dst)
 for k,v in pairs(src) do
  dst[k]=v
 end
end

function ssgn(x)
 if(x==0) return 0
 return sgn(x)
end

function aabb(e1,e2)
 if (e1.x+e1.w/2<e2.x-e2.w/2) return false
 if (e2.x+e2.w/2<e1.x-e1.w/2) return false
 if (e1.y+e1.h/2<e2.y-e2.h/2) return false
 if (e2.y+e2.h/2<e1.y-e1.h/2) return false
 return true
end

function prc(str,x,y,c1,c2)
 pr(str,x-tlen(str)/2,y,c1,c2)
end

function pr(str,x,y,c1,c2)
 local x0=x
 for i=1,#str do
  local char=sub(str,i,i)
  if char=="\\n" then
   x0=x
   y+=6
  elseif char=="&" then
   c1=7
  elseif char=="#" then
   c1=13
   c2=nil
  else
	  if c2 then
	   print(char,x0,y+1,c2)
	  end
	  print(char,x0,y,c1)
	  x0+=4
	  if kerning[char] then
	   x0-=kerning[char]
	  end
	 end
 end
end

function tlen(str)
 local len,max_len,lines=0,0,1
 for i=1,#str do
  local c=sub(str,i,i)
  if c=="\\n" then
   if len>max_len then
    max_len=len
    len=0
    lines+=1
   end
  elseif c=="#" or c=="&" then
   -- do nothing
  else
   len+=4
   if kerning[c] then
    len-=kerning[c]
   end  
  end
 end
 
 return max(max_len,len),lines
end


function reset_pal()
 pal()
 pal(14,131,1)	
 pal(15,139,1)	
end


function decrease(e,p)
 if e[p]>0 then
  e[p]-=1
 end
end


function update_fade()
 for i=0,15 do
  local col,k=i,6*fade_progress
  for j=1,k do
   col=fade_pal[col+1]
  end
  if (col==14) col=131
  if (col==15) col=139
  
  pal(i,col,1)
 end
end

function fadeout()
 while fade_progress<1 do
  fade_progress=min(fade_progress+0.05,1)
  update_fade()
  flip()
 end
end

-->8
-- entities 


-- create and add entity
function make_entity(params)
 local e={
  ⧗ = 0,
  dx=0,dy=0, -- delta movement
  ix=1,iy=1,
  w=8,h=8,
  inair_frames=0,
  visible=true,
  
  lastty=-1,
  g=0,
  
  hp=1,
   
  spr = 0, 
  sw=8,sh=8,
  tw = 1, 
  th = 1,
  
  frame = 1,
  frames = {1},
  fs = 4,
  fc=0,
  
  dir = 1,
  collide=true,
  cd={},
  
  on_draw = draw_entity,
  on_update = update_entity,
  on_air = entity_air,
  on_hit_floor = entity_hit_floor,
  on_hit_ceiling = entity_hit_ceiling,
  on_hit_wall = entity_hit_wall,
--  on_hit_entity = entity_hit_entity
 } 
 
 add_params(params,e)
 
 return add(entities,e)
end

function set_anim(e,frames,loop)
 if (e.frames==frames) return
 
 e.frames=frames
 e.frame=1
 e.fc=0
 e.fs=4
 e.anim_loop=loop
end

function update_entity_x(e)
 e.x += e.dx
 e.dx *= e.ix
end

function update_entity_y(e)
 if e.inair or not e.collide then
  e.y += e.dy
  
  e.dy=min(8,e.dy+e.g)
  
  e.dy *= e.iy
 end
end

function update_entity(e)
 e.⧗ += 1

 -- clear collision data
 e.cd={}

 -- store old values
 e.odx=e.dx
 e.ody=e.dy
 
 e.ox2=e.ox
 e.oy2=e.oy
 e.ox=e.x
 e.oy=e.y
 
 -- collide with world
 update_entity_x(e)

 if e.collide then
  if collide_side(e) then
   if (e==anchor) connect_anchor()
   e.on_hit_wall(e)
  end
 
  -- store last tile y
  e.lastty=flr((e.y+(e.h/2)-0.01)/8)
 end
 
  update_entity_y(e)
 if e.collide then
  if collide_floor(e) then
   if (e==anchor) connect_anchor()

   if e.inair==true  then
    e.on_hit_floor(e)
   end
   e.inair=false
  else 
   if e.inair==false and e.dy==0 then
    if should_fall(e) then
     if e.inair==false then
      e.on_air(e)
     end
     e.inair=true
    end
   else
    if e.inair==false then
     e.on_air(e)
    end
    e.inair=true
   end
   
  end

  if collide_roof(e) then
   if (e==anchor) connect_anchor()

   e.on_hit_ceiling(e)
  end
  
 end
  
 if e.inair then
  e.inair_frames+=1
 else
  e.inair_frames=0
 end

 update_entity_anim(e)
 
end

function update_entity_anim(e)
 if not e.anim_pause then
  e.fc+=1
 end
 
 if e.fc==e.fs then
  e.fc=0
  e.frame+=1
  if e.frame>#e.frames then
   if e.anim_loop then
    e.frame=1
   else
    e.frame=#e.frames
   end
  end
 end
 
end


function draw_entity(e)
 if (not e.visible) return
 
 if debug then
  local x = e.x - e.w/2
  local y = e.y - e.h/2
  rect(x,y,x+e.w-1,y+e.h-1, e.inair and 8 or 11)
  
  -- collisions
  if e.cd.left then
   line(x,y,x,y+e.h-1,7)
  end
  if e.cd.right then
   line(x+e.w-1,y,x+e.w-1,y+e.h-1,7)
  end
  if e.cd.up then
   line(x,y,x+e.w-1,y,7)
  end
  if e.cd.down then
   line(x,y+e.h-1,x+e.w-1,y+e.h-1,7)
  end

--  if (e.reset_count) pr(""..e.reset_count,e.x-4,e.y-9,7)
  if (e.state) pr(""..e.state,e.x-4,e.y-9,7)
 
--  if e.name then
--   print(e.name.."/"..e.dx,e.x-8,e.y-24,7)
--  end
--  
 elseif e.visible then
	 spr(e.frames[e.frame],
	  e.x - e.sw/2, 
	  e.y - e.sh/2, 
	  e.tw, e.th,
	  e.dir==-1)
 end
  
end

function entity_hit_floor(e)
 if e.state==4 then
  -- ladder to normal
  e.state=0
 else
	 for i=0,e.ody/2 do
	  spawn_dust(e.x,e.y+e.h/2-2,
	             i-e.ody/4)
	 end
 end
 
end

function landing_dust(e)
end

function entity_hit_ceiling(e)
end

function entity_hit_wall(e)
end

function entity_air(e)
end

-->8
-- player
player_walk_anim={67,64,65,66}


function make_player(px,py) 
 player_g=0.35
 player_f=2.2
 return make_entity({
  name="player",
  hp=1,
  max_hp=1,
  lore=0,
  
  x=px,y=py,
  g=player_g,
  ix=0,
  w=4, h=6, sh=10,
  canjump=false,
  
  -- state 0 = free
  -- state 1 = ledge
  -- state 2 = collapsed
  -- state 3 = hit
  -- state 4 = ladder
  state=0,
  ledge_cooldown=0,
  collapsed_cooldown=0,
  hit_cooldown=0,
  ladder_cooldown=0,
  rush_cooldown=0,
  jump_cooldown=0,
  jump_cooldown=0,
  reset_count=60,
    
  on_input = get_input,
  on_update = update_player,
  on_draw = draw_player,
  on_air = player_air,
  on_hit_floor = player_hit_floor,
  on_hit_wall = player_hit_wall,
  on_hit= player_hit,
  on_fall= function(e)
   if e.rushing then
    if e.rush_g == player_g then
     e.rush_g=0
    end
   else
    if e.state!=4 then
	    set_anim(e,{78})
	   end
	  end
  end,
  
  rush_count=0,
  
  -- cheats
--  upg_grab=true,
--  upg_stomp=true,
--  upg_vines=true,
--  upg_scale=true,
--  upg_rush=true,

 },entities)
end


function get_input(e)
 if e.state==0 then
  -- normal movement
  
  if e.upg_rush and 
     btnp(❎) and 
     e.rush_cooldown==0 and 
     e.rush_count==0 then
   sfx(62)
   e.dy=0
   e.rushing=true
   e.rush_count=8
   e.rush_cooldown=30
   
   if e.inair then
    e.rush_g=0
   else
    e.rush_g=player_g
   end
  end
	 
	 if e.rushing then
   -- full speed ahead
   e.dx=3*e.dir
	 else
	  if not e.stomped then
		  -- player decides
			 if btn(⬅️) then 
		   e.dx-=1
			  e.dir=-1
			 end
			 if btn(➡️) then
		   e.dx+=1
			  e.dir=1
			 end
			end
	 end
	 
	 if not e.inair then
	  set_anim(e,
	   abs(e.dx)>0.1 and player_walk_anim or {64},
	   true)
	   
	  -- climb down ladder?
	  if btn(⬇️) and not e.inair and fget(_mget(e.x\\8,(e.y+4)\\8),2) and e.ladder_cooldown==0 then
    e.y+=4
    grab_ladder(e)
   end
	 end
	 
	 if not btn(🅾️) then--and e.dy>=0 then
	  e.canjump=true
	 end
  
  if e.canjump and btnp(🅾️) then
	  -- regular jump
	  if e.inair_frames<5 then
	   jump(e)
	   e.inair_frames=5
	  end

	  -- stomp
	  if e.upg_stomp and e.inair and not e.stomped and e.jump_cooldown==0 then
	   sfx(61)
	   e.stomped=true  
	   e.dy=2
	   set_anim(e,{75})
	   e.canjump=false
	  end
	 end
	 
	 -- grab ladder
	 if e.state!=4 then
 	 if btn(⬆️) and fget(_mget(e.x\\8,e.y\\8),2) then
    if e.ladder_cooldown==0 then
     grab_ladder(e)
	   end
	  elseif btn(⬇️) and fget(_mget(e.x\\8,(e.y)\\8),2) then
    if e.ladder_cooldown==0 then
     grab_ladder(e)
	   end
	  end
		end 
		 
		
	elseif e.state==4 then
	 -- on a ladder
	 if btn(⬆️) then
	  e.y-=0.5
	  e.anim_pause=false
	  -- leave ladder if in air
	  if not fget(_mget(e.x\\8,(e.y)\\8),2) then
    set_anim(e,{64})
    e.y=8*(e.y\\8)+5
    e.inair=false
    e.state=0
    e.anim_pause=false
   end
	 elseif btn(⬇️) then
	  e.y+=0.5
	  e.anim_pause=false

	  -- leave ladder if in air
	  if not fget(_mget(e.x\\8,(e.y)\\8),2) then
    set_anim(e,{78})
    e.inair=true
    e.state=0
    e.anim_pause=false
   end
  else
	  e.anim_pause=true
	 end
	 if btnp(🅾️) then
	  if btn(⬇️) then
	   -- drop down from ladder
	   e.state=0
	   set_anim(e,{78})
	   e.inair=true
	   e.ladder_cooldown=15
	  else
	   jump(e)
	   e.ladder_cooldown=6
	  end
	 end 
	 
	elseif e.state==1 then
	 -- on ledge
	 if (btn(⬅️) and e.dir==1) or (btn(➡️) and e.dir==-1) then
	  set_anim(e,{68})
	 else
	  set_anim(e,{69})
	 end
	 
	 if e.ledge_cooldown==0 then
	  -- drop?
		 if btn(⬇️) then
			 e.state=0
    set_anim(e,{77,77,78})
  	 e.g=player_g

		  e.ledge_cooldown=7
 		 e.dx=0
		 end 
		 -- jump up
		 if btn(🅾️) then
		  e.ledge_cooldown=3
			 e.state=0
			 e.g=player_g
			 e.canjump=false
			 set_anim(e,{78})
			 if btn(➡️) or btn(⬅️) then
	 	  e.dy=-player_f
   	 if (btn(⬅️) and e.dir==1) or (btn(➡️) and e.dir==-1) then
			   set_anim(e,{76,76,77,78})
   	 end
		  else
		   e.dx=-e.dir
		  end
   end
	 end
	 
	end	 	
	 		 	
end

function player_hit_wall(e)
	if pl.rushing then
 	pl.rushing=false
 	pl.rush_count=0
 	pl.rush_cooldown=0
 	shakex=-pl.dir
 end
end

function grab_ladder(e)
 e.state=4
 e.rushing=false
 e.rush_count=0
 e.rush_cooldown=0
 e.g=0
 e.dir=1
 e.x=(e.x\\8)*8+3
 e.dx,e.dy=0,0
 set_anim(e,{73,74},true)
end

function jump(e)
 e.state=0
 e.jump_cooldown=5
 e.anim_pause=false
 e.dy=-player_f
 e.inair=true
 e.canjump=false
 set_anim(e,{76,76,76,77,77,78},false)
 e.fs=2
 
 sfx(53)
end



function update_player(e)
 -- todo: use generic function
 --  for cooldowns
 if e.ledge_cooldown>0 then
  e.ledge_cooldown-=1
 end
 
 if e.jump_cooldown>0 then
  e.jump_cooldown-=1
 end

 if e.rush_cooldown>0 then
  e.rush_cooldown-=1
  if e.rush_cooldown==0 then
   e.flash=7
  end
 end

 if e.ladder_cooldown>0 then
  e.ladder_cooldown-=1
 end
 
 if e.rush_count>0 then
  e.rush_count-=1
  if e.rush_count<=0 then
   e.rushing=false
  end
 end
 
 if not e.inair then
  e.stomped=false
  e.jump_cooldown=0
 end

 if e.state==0 then
  -- feels like a hack!
  -- todo: solve
  
  if e.rushing then
   e.g=e.rush_g
  else
   e.g=player_g
  end
 end
 
 if e.state==0 then
  -- normal movement

	 -- check for ledge
	 if pl.upg_grab then
		 if e.dy>0 and e.dx!=0 and e.ledge_cooldown==0 then
			 local tx=e.x\\8+e.dir
			 local dist=abs(tx*8+4-e.x)
	
			 if dist<8 then
				 local ty=e.y\\8
				 local t1=_mget(tx,ty-1)
				 local t2=_mget(tx,ty)
				 local t3=_mget(tx-e.dir,ty)
				 local t4=_mget(tx-e.dir,ty+1)
				 t1=fget(t1,0) 
     if (fget(t2,4) and e.upg_scale) t1=false
				 t2=fget(t2,0) 
				 t3=fget(t3,0) --or fget(t3,1)
				 t4=fget(t4,0) --or fget(t4,1)
				 if not t1 and 
				    not t3 and 
				    t2 and 
				    not t4 then
					 -- grab ledge
					 sfx(60)
					 e.ledge_cooldown=7
					 e.state=1
					 set_anim(e,{69})
					 e.dy=0
					 e.g=0
					 e.y=ty*8+e.h/2+2
					 if e.dx>0 then
		 			 e.x=tx*8-e.w/2
		 			else
		 			 e.x=tx*8+e.w+7
		 			end
		 			
					end
				end
		 end	 
  end
  
	elseif e.state==2 then
  if e.hp>0 then
	  if intro<0 then
	   e.collapsed_cooldown-=1
	  end
	  if e.collapsed_cooldown==0 then
	   e.state=0
	   if not tips.woken_up then
	    tips.woken_up=true
	    speak({
	     "uHH... wHAT\\nHAPPENED?",
	     "sUDDENLY THE \\nSHIP SHUT DOWN!",
	     "    ...   ",
	     "wHERE AM i?"
	    })
	   end
	  end
	 else
	  if e.reset_count>0 then
 	  e.reset_count-=1
	  end
	  if e.reset_count==0 then
 	  fadeout()
 	  e.state=0
 	  if current_cp then
 	   e.x=current_cp.x
 	   e.y=current_cp.y+1
     set_cam(64*(pl.x\\64),64*(pl.y\\64))
 	  end
    swap_room(camtx\\64,camty\\64)
 	  e.hp=e.max_hp
		  -- talk to it if first time
    if not tips.respawn then
     tips.respawn=true
     speak({"wHAT\\nHAPPENED?","hOW AM i\\nSTILL ALIVE?"})
	   end
	   set_anim(e,{64})
	   e.reset_count=30
	  end
	 end
	 
	elseif e.state==3 then
  e.hit_cooldown-=1
  if e.hit_cooldown==0 then
  -- if pl.hp>0 then
    e.state=0
    e.ix=0
  -- end
  end
	end
	
 local ▒=_mget(e.x\\8,e.y\\8)
 if e.state!=3 then
	 if fget(▒,3) then
   if (pl.hp>0) sfx(58)
   hit_player(pl,99,
     -ssgn(e.x-pl.x),
     -1)
	 end
	end
	
 if pl.state==0 and not pl.inair then
  if lore_reply then
   speak(lore_reply)
   set_anim(pl,{64})
  end
 end
	
	
 update_entity(e)


	if e.y\\8>31 then
	 collapse_player()
	 e.hp=0
	 e.dy=0
	end

end

function player_hit_floor(e)
 sfx(54) 
 
 if pl.state==4 then
  e.ladder_cooldown=8
  e.state=0
 end
 

 entity_hit_floor(e)
 
 if (not e.stomped and e.ody>6) or e.hp<=0 then
  hit_player(pl,1)
  collapse_player(true)
  pl.ix=0
 else
  if pl.state==3 then
   if pl.hp>0 then
    set_anim(pl,{72})
   end
  end
 end
 
end

function collapse_player()
 pl.state=2
 pl.collapsed_cooldown=30
 set_anim(pl,pl.hp>0 and {71,71,71,72} or {71})
 pl.fs=8
end


function hit_player(src,amnt,dx,dy)
 if pl.hp>0 and pl.state!=3 then
	 pl.hp-=amnt 
	 
	 pl.state=3
		pl.inair=true
	 pl.hit_cooldown=15
	 
	 pl.rushing=false
	 pl.rush_count=0
	 
	 pl.ix=0.7
	 
	 pl.dx=dx or pl.dx
	 pl.dy=dy or pl.dy
	 
	 set_anim(pl,{70})
	 
	end
end


function draw_player(e)
 if e.rushing or e.stomped then
  ox,oy=pl.x,pl.y

  for i=1,15 do pal(i,12) end
  pl.x,pl.y=pl.ox2,pl.oy2
  draw_entity(e)

  for i=1,15 do pal(i,7) end
  pl.x,pl.y=pl.ox,pl.oy
  draw_entity(e)

  pl.x,pl.y=ox,oy
  reset_pal()
 end
 
 pal(10,4)
 
 if outro_step!=7 then
	 if pl.upg_grab then
	  pal(10,3) -- hands
	 end
	 if pl.upg_stomp then
	  pal(2,14) -- feet
	 end
	 if pl.upg_vines then
	  pal(4,3) -- head
	 end
	 if pl.upg_scale then
	  pal(7,11) -- torso
	  pal(6,15) -- torso
	 end
	 if pl.upg_rush then
	  pal(13,3) -- pants
	  pal(5,14) -- pants
	 end
	end
 
 draw_entity(e)
 reset_pal()

 if e.flash then
  e.flash-=1
  line(e.x-2,e.y-e.flash+2,
       e.x+2,e.y-e.flash+2,12)
  if (e.flash==0) e.flash=nil
 end

end


-->8
-- enemies
function make_blob(px,py) 
 return make_entity({
  name="blob",
  
  x=px,y=py,
  g=0,
  ix=0,
  w=2, h=4, sh=10,
  
  hp=1,
  frames={81},
    
  delay=(px*py)%30,
  direction=1,
     
  on_update = function(e)
   e.delay-=1
   if e.delay<=0 then
    e.delay=25+px%30
    e.direction=-e.direction
    e.dy=2*e.direction
    set_anim(e,{82})
    e.h=4
   end
   
   update_entity(e)
  end,

  on_hit_floor = function(e)
   sfx(59)
   set_anim(e,{81,80,81})
   e.fs=3
   e.h=2
  end,
  on_hit_ceiling = function(e)
   sfx(59)
   set_anim(e,{83,84,83})
   e.fs=3
   e.h=2
  end,
  
  on_hit_player = function(e)
   if not pl.rushing then
    hit_player(e,1,
     -ssgn(e.x-pl.x),
     -1)
   else
    make_blobsplash(e.x,e.y,pl.dir)
    del(entities,e)
   end
  end,
  
 },entities)
end


function make_upgrader(px,py) 
 return make_entity({
  name="upgrader",
  
  x=px,y=py,
  g=0,
  ix=0,
  w=2,h=2,sh=14,
  
  hp=1,
  frames={145},  
  countdown=60,
     
  on_update = function(e)
   -- spawn particles
   if (rnd()<1.1-2*e.countdown/120) make_dot(e.x,e.y-4)
   
   update_entity(e)
   
   if not e.hitplayer then
    e.countdown=60
   else
    e.hitplayer=false
    pl.x=e.x
    shakey=rnd(2)-1
    if e.countdown==0 then
     del(entities,e)
     
     local x=pl.x\\8
     if x==66 then
      pl.upg_grab=true
      speak({
       "i FEEL...\\ndIFFERENT...",
       "mY ARMS ARE\\nSTRONGER!"
      })
     elseif x==125 then
      pl.upg_stomp=true
      speak({
       "aNOTHER\\nTRANSFORMATION!",
       "tHINK i CAN\\nCONTROL MY\\nJUMPS BETTER!",
       "#(pRESS z\\nTO DIVE.)"
      })
     elseif x==5 then
      pl.upg_scale =true
      speak({
       "gENIUS!",
       "nOW i CAN\\nCLIMB THOSE\\nWEIRD WALLS."
      })
     elseif x==51 then
      pl.upg_rush =true
      speak({
       "oUF. iT HURTS\\nMORE AND MORE.",
       "bUT i FEEL\\nFASTER...",
       "#(pRESS x\\nTO DASH.)"
      })
     elseif x==83 then
      pl.upg_vines=true
      speak({
       "tHE VINES...\\ni CAN FEEL THEM!","eVEN CONTROL\\nTHEM!"
      })
     end
    end
   end
  end,
  
  on_hit_player = function(e)
   if e.countdown>0 then
    e.countdown-=1
   end
   if e.countdown==50 then 
    sfx(63)
   end
   e.hitplayer=true
  end,
  
 },entities)
end


function make_pod(px,py) 
 return make_entity({
  name="pod",
  
  x=px,y=py,
  g=0,
  ix=0,
  
  hp=1,
  frames={148},  
     
  on_update = function(e)
   -- spawn particles
   if (rnd()<0.15) make_smoke(e.x+3,e.y,4)
   
   update_entity(e)
   
  end,
  
 },entities)
end



--function make_spinner(px,py) 
-- local e=make_entity({
--  name="spiner",
--  
--  x=px,y=py,
--  g=0,
--  ix=0,
--  h=12,
--  collide=false,  
--
--  on_hit_player = function(e)
--   if pl.state==0 and 
--      pl.upg_rush and 
--      not pl.inair then
--    pl.rushing=true
--   end
--  end,
--
-- },entities)
-- 
-- set_anim(e,{112,113,114,115},true)
-- 
-- return e
--end

function make_vines(px,py) 
 return make_entity({
  name="vines",
  
  x=px,y=py,
  g=0,
  ix=0,
  
  frames={116},  
     
  on_update = function(e)
   if pl.upg_vines then
    if abs(e.y-pl.y)<4 then
     local dx=abs(e.x-pl.x)
     e.frames={min(max(116,120-dx\\3),120)}
    end
   end
  end,
  
  on_hit_player = function(e)
   if not pl.upg_vines then
    local d=ssgn(pl.x-e.x)
    pl.x=e.x+d*7
   end
  end,
  
 },entities)
end


function make_mushroom(px,py) 
 return make_entity({
  name="mushroom",
  
  x=px,y=py+2,
  g=0,
  ix=0,
  collide=false,
  h=4,sh=12,
  
  frames={88},  

  on_update = function(e)
   update_entity(e)
  end,
  
  on_hit_player = function(e)
   if pl.inair and pl.dy>0 and pl.hp>0 then
    
    pl.dy=pl.stomped and -4 or -3
    pl.stomped=false
    set_anim(pl,{76,76,77,78})

    set_anim(e,{89,91,89,90,89,88})   
   
    sfx(55)
   end
  end,
  
 },entities)
end



function make_checkpoint(px,py) 
 return make_entity({
  name="checkpoint",
  
  x=px,y=py,
  g=0,
  ix=0,
  collide=false,
  w=3,

  frames={96},  
  actived=false,

  on_hit_player = function(e)
   
   -- lit up
   make_flame(e.x,e.y)

   -- deactivate all
   for e2 in all(entities) do
    if e2.name=="checkpoint" then
     e2.activated=false
     set_anim(e2,{96})
    end
   end
   
   -- activate this
   e.activated=true
   set_anim(e,{97})
   if current_cp!=e then
    sfx(57) 
   end
   
   current_cp=e
  end,
  
 },entities)
end




function make_bearpig(px,py) 
 return make_entity({
  name="bearpig",
  
  x=px,y=py+2,
  g=0.2,
  ix=0.99, iy=1,
  collide=true,
  w=6, h=4, sh=12,

  frames={98},
  delay=0, 
  
  on_update = function(e)
   decrease(e,"delay")
   if e.inair then 
    e.dx=2*e.dir
   end
   if not e.inair and e.delay==0 then
	   local dx=abs(pl.x-e.x)
	   local dy=abs(pl.y\\8-e.y\\8)
	   if dx<24 then
	    if dy<2 then
	     e.frames={99}
	     e.dir=sgn(pl.x-e.x)
	     
	     if dx<16 then
	      e.dx=2*e.dir
	      e.dy=-0.8
	      e.inair=true
 	     e.frames={100}
	     end 
	    end  
	   end
	   if dx>28 then
	    if dy<3 then
	     e.frames={98}
	    end  
	   end
	  end
   
   update_entity(e)
  end,
  
  on_hit_floor = function(e)
   e.dx,e.dy=0,0
	  e.frames={99}
   e.delay=16
   entity_hit_floor(e)
  end,
  
  on_hit_player = function(e)
    hit_player(e,1,
     -ssgn(e.x-pl.x),
     -1)
  end,
  
 },entities)
end


--
--function make_heartfruit(px,py) 
-- return make_entity({
--  name="vines",
--  
--  x=px,y=py,
--  g=0,
--  ix=0,
--  w=4,
--  
--  frames={92},  
--     
--     
----  on_update = function(e)
----  end,
--  
--  on_hit_player = function(e)
--   e.frames={93}
--   e.on_hit_player=nil
--   pl.max_hp+=1
--   pl.hp=pl.max_hp
--   
--   if not tips.heartfruit then
--    tips.heartfruit=true
--    speak({
--     "tHIS IS TASTY!",
--     "i CAN FEEL MY\\nBODY STRENGTHEN!"
--    })
--   end
--  end,
--  
-- },entities)
--end



function make_lorb(px,py) 
 return make_entity({
  name="lorb",
  
  x=px,y=py+1,
  g=0,
  ix=0,
  w=4,h=4,sh=12,
  
  frames={121,122,123,124},     
  anim_loop=true,
  fs=5,
  
  on_hit_player = function(e)
   sfx(56) 
   
   pl.lore+=1
   del(entities,e)
   active_lore=true
   lorex=e.x-camtx
   lorey=e.y-camty
   lore_count=1
   if pl.lore==1 then
    lore_reply={"bRING ME HERE?\\nwHAT'S GOING ON?","wHAT WAS\\nTHAT EVEN?"}
   elseif pl.lore==2 then
    lore_reply={"tHE CORE?\\nwHERE COULD\\nTHAT BE?"}
   elseif pl.lore==8 then
    lore_reply={"lET'S DO THIS!"}
   end
  end,
  
 },entities)
end


function make_twinkle(px,py) 
 return make_entity({
  name="twinkle",
  
  x=px,y=py,
  g=0,
  ix=0,
  collide=false,
  
  frames={0}, 
  
  twinkling=false,  
  
  on_update = function(e)
   if rnd()<0.02 and not e.twinkling then
    if rnd()<0.5 then
     set_anim(e,{195,196,197,197,197,197,196,195,0})
    else
     set_anim(e,{195,196,196,195,0})
    end
    e.twinkling=true
   else
    if e.frames[e.frame]==0 then
     e.twinkling=false
    end
   end
   
   update_entity(e)
  end,
    
 },entities)
end



function make_fan(px,py) 
 return make_entity({
  name="fan",
  
  x=px,y=py,
  g=0,
  ix=0,
  w=24,h=71,
  collide=false,
  
  frames={94},   
  
  on_update = function(e)
   local r=0.05
   if pl.x\\64==4 and pl.y\\64==2 then
    r=0.5
   end
   if rnd()<r then
    spawn_leaf(e.x+rnd(20)-10,e.y+e.h/2+8)
   end
  end,
  
  on_hit_player = function(e)
   pl.dy-=0.45
   pl.inair=true
   pl.frame=1
   pl.frames={rnd()<0.5 and 77 or 78}
  end,
  
 },entities)
end



function make_outro(px,py) 
 return make_entity({
  name="outro",
  
  x=px,y=py,
  g=0,
  ix=0,
  collide=false,
  
  frames={94},   
    
  on_hit_player = function(e)
   outro=1
   outro_step=1
   pl.frames={64}
   pl.frame=1
   del(entities,e)
   
   lorex=32
   lorey=32

   for i=1,pl.lore do
    make_spin_orb(pl.x+4,pl.y-3,i/pl.lore)
   end

   if pl.lore==8 then
    speak({"i THINK WE'RE\\nHERE...","tHIS IS IT,\\nRIGHT?"})
   else
    speak({"i HOPE THIS\\nIS IT.","i HAVE NOTHING\\nMORE TO GIVE."})
   end
  end,
  
 },entities)
end


function make_spin_orb(px,py,a,spd,tween) 
 return make_entity({
  name="slorb",
  
  x=px,
  y=py,
  g=0,
  ix=0,
  spd=spd or 64,
  tween=tween or 0.05,
  
  frames={121,122,123,124},     
  anim_loop=true,
  fs=5,
  a=a,
  tx=px,
  ty=py,
  ry=0,
  collide=false,
  
  on_update=function(e)
   e.tx=928+28*cos(e.a+e.⧗/e.spd)
   e.ty=94+28*sin(e.a+e.⧗/e.spd)+e.ry
   
   
   
   if outro_step==2 then
    e.spd=max(10,e.spd-0.25)
   end
   
   if outro_step==3 then
    e.ry-=8
   end
  
   e.x+=(e.tx-e.x)*e.tween
   e.y+=(e.ty-e.y)*e.tween
   update_entity(e)
  end,
  
 },entities)
end


-->8
-- particles

function update_particles(a)
 for p in all(a) do
  p.dy+=p.g

  p.x+=p.dx
  p.y+=p.dy

  p.dx*=p.ix
  p.dy*=p.iy
  
  if (p.uf) p.uf(p)
  if not p.immortal then
   p.⧗+=1
   if p.⧗>p.life then
    del(p.tbl,p)
   end
  end
 end
end

function make_dot(x,y)
 local r=rnd(16)+16
 local a=rnd()
 local f=0.8+rnd(0.3)

 add(particles2, {
  tbl=particles2,
  ⧗=0,
  x=x+r*cos(a), 
  y=y+r*sin(a),
  dx=-0.02*f*r*cos(a),
  dy=-0.02*f*r*sin(a),
  ix=1,
  iy=1,
  g=0,
  
  life=45,
  
  on_draw=function(p)
   
--   local cols=split"1,14,3,15,11,10,7,7,7,7,7,11,14"
   local cols=split"1,5,13,12,12,12,7,7,7,12,13,1"
   local r=2-3*p.⧗/45
   circfill(p.x,p.y,r,
    cols[1+flr(#cols*p.⧗\\p.life)]
   )
  end

 })
end


function spawn_landing_dust(e)
 for i=0,e.ody/2 do
  spawn_dust(e.x,e.y+e.h/2-2,
             i-e.ody/4)
 end
end

function spawn_dust(x,y,dx)
 add(particles2, {
  tbl=particles2,
  ⧗=0,
  x=x, y=y,
  dx=dx,
  dy=0,
  ix=0.9,
  iy=1,
  g=0,
  c1=6,--4,
  c2=13,--2,
  
  life=8+rnd(8),
  
  on_draw=function(e)
    local r=min(1,(e.life-e.⧗)/16)
    if e.dy==0 then
     clip(0,flr(e.y-9-camy)%128,127,11)
    end
    circfill(e.x,e.y+1,r*2.5,e.c2)
    circfill(e.x-1,e.y+1,r*2.5,e.c1)
    clip()
   end,

 })
end



function make_smoke(px,py)
 add(particles2, {
   tbl=particles2,
   ⧗=0,
   x=px, y=py,
   r=rnd(0.5),
   life=20+rnd(20),
   g=-rnd(0.3)-0.2,
   dx=rnd(0.2), dy=-rnd(0.2),
   ix=1, iy=0,

   on_draw=function(pp) 
    pp.r+=0.2
    if pp.life-pp.⧗<5 then
     fillp(0b1010010110100101.1)
    end
    if pp.life-pp.⧗<2 then
     fillp(0b0111111111011111.1)
    end
    
    ovalfill(pp.x-pp.r/2,pp.y-pp.r/2,
             pp.x+pp.r/2,pp.y+pp.r/2,
             5)
    ovalfill(pp.x-pp.r/2,pp.y-pp.r/2,
             pp.x+pp.r/2-1,pp.y+pp.r/2-1,
             13)
    fillp()
   end,
  })

end



function make_blobsplash(x,y,dx)
 add(particles2, {
  tbl=particles2,
  ⧗=0,
  x=x-4, y=y-4,
  dx=dx,
  dy=-0.1,
  ix=0.9,
  iy=1,
  g=0.02,
  
  life=15,
  
  on_draw=function(e)
   spr(85+(e.⧗-1)\\5,e.x,e.y)
  end 

 })
end

-- todo:
-- make anim particle with splash
function make_flame(x,y,dx)
 add(particles2, {
  tbl=particles2,
  ⧗=0,
  x=x-5+rnd(3), y=y-4,
  dx=0,
  dy=-rnd(1),
  ix=1,
  iy=1,
  g=0,
  
  life=15,
  
  on_draw=function(e)
   spr(112+(e.⧗)\\4,e.x,e.y)
  end 

 })
end


function spawn_leaf(x,y)
 add(particles2, {
  tbl=particles2,
  ⧗=0,
  x=x-4, y=y,
  dx=0,
  dy=-rnd()-1,
  ix=1,
  iy=1,
  g=0,
  spd=flr(rnd(4))+2,
  
  life=72,
  c=rnd()<0.25,
  
  on_draw=function(e)
   if e.c then
    pal(14,2)
    pal(3,4)
   end
   if e.⧗<70 then
    spr(107+(e.⧗\\e.spd)%4,e.x,e.y)
   else
    pset(e.x+4,e.y+4,14)
   end
   if e.c then
    reset_pal()
   end
  end 

 })
end

function spawn_sand(x,y,dx)
 add(particles2, {
  tbl=particles2,
  ⧗=0,
  x=x, y=y,
  dx=dx,
  dy=0,
  ix=1,
  iy=1,
  g=0,
  c=rnd({2,2,4,4,4,4,9}),
  
  life=999,
  
  on_draw=function(e)
   if e.x>252 then
    del(e.tbl, e)
   end
   e.y+=sin(t()/100+e.⧗/100+0.25)
  
   pset(e.x,e.y,e.c)
  end 

 })
end
-->8
-- platforming

-- code adapted from  
-- https://www.lexaloffle.com/bbs/?tid=28793
-- by matt hugeson

--check if pushing into side tile and resolve.
function collide_side(self)

	local hh=self.h/2
	local wh=self.w/2
	local data={}
	for i=-hh,hh-1 do
	 -- check to the right
	 if self.dx>=0 then
	  local t=_mget((self.x+wh)/8,(self.y+i)/8)
		 if fget(t,0) then
			 self.dx=0
			 self.x=flr(((self.x+wh)/8))*8-wh
				self.cd.right=true
				return true
	 	end
  end
  
  -- check to the left
		if self.dx<=0 then
   local t=_mget((self.x-wh)/8,(self.y+i)/8)
		 if fget(t,0) then
	 		self.dx=0
	 		self.x=flr((self.x-wh)/8)*8+8+wh
				self.cd.left=true
		 	return true
		 end
 	end
	end
	
	--didn't hit a solid tile.
	return nil
end

--check if standing on air
function should_fall(self)
 if (self.inair) return true

 local air=true
 for i=-(self.w/2),(self.w/2)-1 do
  local newty=flr((self.y+(self.h/2)+1)/8)
  local tile=_mget((self.x+i)/8,newty)
  if fget(tile,0) or fget(tile,1) then
   air=false
  end
 end
 
 if not self.inair and air and self.on_fall then
  self.on_fall(self)
 end

 return air
end

--check if pushing into floor tile and resolve.
function collide_floor(self)
	--only check for ground when falling.
	if self.dy<0 then
		return false
	end
	local landed=false
	--check for collision at multiple points along the bottom
	--of the sprite: left, center, and right.
	for i=-(self.w/2),(self.w/2)-1 do
  local newty=flr((self.y+(self.h/2))/8)
  local tile=_mget((self.x+i)/8,newty)
  if fget(tile,0) then
   landed=true
  end
  if (fget(tile,1)) then
   if (self.lastty<newty) landed=true
		end
	end

 if (landed) then
  self.dy=0
  self.y=(flr((self.y+(self.h/2))/8)*8)-(self.h/2)
		self.ly=self.y
		self.cd.down=true
 end

	return landed
end

--check if pushing into roof tile and resolve.
function collide_roof(self)
	--check for collision at multiple points along the top
	--of the sprite: left, center, and right.
 local collided=false
	for i=-(self.w/2),(self.w/2)-1 do
		if fget(_mget((self.x+i)/8,(self.y-(self.h/2))/8),0) then
			self.dy=0
			self.y=flr((self.y-(self.h/2))/8)*8+8+(self.h/2)
   collided=true
			self.cd.up=true
		end
	end
 return collided
end

-->8
-- !spoilers! --

lore={
 "WE USED OUR\\nLAST POWERS\\nTO BRING YOU\\nHERE",
 "WE ARE WEAK\\nOUR POWER LOST\\nTAKE US TO\\nTHE CORE",
 "WE THOUGHT\\nUS INVINCIBLE\\nBUT OUR PLANET\\nCOLLAPSED",
 "EIGHT OF US\\nSTAYED BEHIND\\nSO MILLIONS\\nCOULD ESCAPE",
 "EONS HAVE\\nPASSED SINCE\\nTHE CALAMITY",
 "ALL THAT NOW\\nREMAINS ARE\\nOUR SPIRITS",
 "OUR WORLD...\\nA MIRACLE\\nNOW ONLY\\nRUINS REMAIN",
 "AT LAST WE\\nARE TOGETHER\\nHELP US\\nMOVE ON",
 "WE ARE\\nFINALLY HERE\\nREADY\\nTO MOVE ON",
 "WE OWE YOU\\nOUR ETERNAL\\nGRATITUDE",
 "NOTHING\\nIS LEFT\\nCOME\\nWITH US",
 "OUR JOURNEY\\nCONTINUES\\n\\nTOGETHER"
}

function draw_lore(id)
 -- make wobbly ovals
 local r1=min(29,lore_count*2)
 local w1=r1+2*sin(t())
 local h1=r1+2*cos(t()*1.5)
 local w2=w1-2
 local h2=h1-2
 ovalfill(lorex-w1,lorey-h1,lorex+w1,lorey+h1,12)
 ovalfill(lorex-w2,lorey-h2,lorex+w2,lorey+h2,7) 
 
 lorex+=(32-lorex)*0.1
 lorey+=(32-lorey)*0.1
  
 if lore_count>15 then
  local lines=split(lore[id],"\\n")
  for l=1,min(#lines,(lore_count-15)/8) do
   pr(lines[l],32-tlen(lines[l])/2,12+l*7,12)
  end
 
  spr(126+sin(t()),56,56)
 end
end



function update_outro()
 if outro_step<2 then
  if rnd()<0.05 then
   make_dot(928,96)
  end
 elseif outro_step<4 then  
  make_dot(928,96)
 end
 	 
 outro+=1
 if outro==120 then
  outro_step=2
  active_lore=true
  lore_count=1
 elseif outro==121 then
  if pl.lore==8 then
   outro_step=2.5
   active_lore=true
   lore_count=1
  end    
 elseif outro==150 then
  if pl.lore==8 then
   last_orb=make_spin_orb(pl.x+4,pl.y-3,15/16,80,0.03)
   last_orb.is_player=true
   set_anim(last_orb,{185})
   del(entities,pl)
  else   
   speak({"i HOPE IT\\nWILL WORK!"})
  end
 elseif outro==180 then
  if pl.lore==8 then
   set_anim(last_orb,{185,169},true)  
  end
 elseif outro==220 then
  if pl.lore==8 then
   set_anim(last_orb,{121,122,123,124})  
  end
  outro_step=3
  sfx(51)
 elseif outro==260 then
  outro_step=4
  lorey=-32
  active_lore=true
  lore_count=1
 elseif outro==261 then
  fadeout()

  if pl.lore==8 then
   -- good ending
   --  goto end screen
   outro_step=5
  else
   -- bad ending
   --  launch animaiton
   
   -- wait a bit
   for i=0,45 do 
    flip() 
   end
   
   -- run animatiom
   outro_step=6
   camx,camtx=192,192
   camy,camty=64,64
   pl.x=255
   pl.y=101
   pl.dir=-1
   pl.visible=false
   set_anim(pl,player_walk_anim,true)
  end
 end
 
 -- end screen
 if outro_step==5 then
  if outro>300 then
	  if btnp(❎) or btnp(🅾️) then
	   fadeout()
	   run()
	  end
	 end
	end
	
	-- handle bad ending
 if outro_step==6 then
  if outro>320 and outro<420 then
   -- walk into screen
   pl.x-=0.25
   pl.fs=8
   pl.visible=true
  end
  
  if outro==400 then
   sfx(54) 
   set_anim(pl,{72})
   speak({"gASP!\\nmY LUNGS...","uNBEARABLE.."})
  elseif outro==401 then
   set_anim(pl,player_walk_anim,true)
  elseif outro==421 then
   sfx(54) 
   set_anim(pl,{72})
   speak({"i CAN'T\\nCONTINUE.","mY JOURNEY\\nENDS HERE."})
  elseif outro==434 then
   set_anim(pl,{71,184})
   pl.fs=30
   sfx(54) 
  elseif outro==480 then 
   outro_step=7
  end
 end
  
 if outro_step==7 then
  if outro==480 then
   set_anim(pl,{184,183,182,166,150,150,134})
   pl.fs=8
   sfx(57) 
  elseif outro>600 then
   fadeout()
   outro_step=5
  end
  
 
 end
 
end
__gfx__
000000003bb3fbb33bbf3bbb3bbf3bb33282882b01111110000000003bb3fbb33bbf3bbb3bbf3bb301100000000000000000000001e000100100000100000000
00000000bff33ffeeff33fffeff33ffbef2338ff00ee111100010000bff33ffeeff33fffeff33ffb0ee000000000000000000000003000e00e00000100000000
00000000ff3eee3333eee3f333eee3ff332ee2f311ee133110111010ff3eee3333eee3f333eee3ff0e3000000000000000000000003e3e000300000e00000000
00000000f333e333333e33ee333e333f332e33eeee11333e1331e110f333e333333e33ee333e333f03300000000000000000000000303000030000e000000000
00000000fee311eeee11333eee113eefee11333e333e33ee13eee110fee311eeee11333eee113eef0f300000000000000000000000e030000300003003000000
0000000033e1ee1111ee133111ee1e3311ee133133eee3f3ee133ee033e1ee1111ee133111ee1e330f3000000000000ee000000000003000003000e000b00300
000000003e33ee0000ee111100ee33e300ee1111eff33fffe1e333eeee33ee0000ee111100ee33ee03300000000000e33e0000000000e00000300e0000b03000
00000000f3331e100110011001e1333f011001103bbf3bbb33ee11ee0eeeeeeeeeeeeeeeeeeeeee003e00000000e333ff333e000000000000003e00030303000
08888880bf3ee11001100000001e33e3bf3ee100001ee3fb0000000000000000444424444000000000e00000e33f3fe0000000000000000003b3e00000000000
82222222bffe331101110110101e33fbbffe30000003effb0000100000000000222212220240000000300000efef3e0000000000000003000e333e00000e3b30
82111182bf333311000001101ee13efbbf331000000133fb0101110100000000010000102200000000300000330fe0000000000000000b00ee00000000e333e0
8211118233e33110000001000ee1ee3ff3e1110000111e3f011e1331000000000e0000e0244900000f300000fe0300000000000000000b000003b000000000ee
82111182f3ee1ee00000000001133e33f3e0110000110e3f011eee310000000003000e004400000003000000f00e00000000000000000303330e3300000b3000
82111182bfe31ee100000000113333fb3ee0100000010ee30ee331ee0000000000f00e0022004490030000003000000000000000003003b00ee033e00033e033
82888822bf33e101000000001133effbe10000000000001eee333e1e0000000000f3e000024440000f000000e000000000e00000000b033000000ee00e330ee0
022222203e33e10000000000011ee3fb1000000000000001ee11ee33000000000030000044420000030000000000000000030e0000030330000000000ee00000
000000003333f00000000000000f3333ee11e3ffff3e11ee44444244000000000000000000000004030000000000000000000000000000000000000000000003
00000000bf333e100110000001e333fbe333ee1ee1ee333e2222212200100000000000000000042003000000000000066d00000000000000000000000000003e
00000000ff3eee333eeee11e33eee3ff0e33e1eeee1e33e00011000000e000000000000000000022030000000000066666d00000300000003000000000003ee0
00000000f333e33333ee33ee333e333f011ee1e11e1ee1100220000000e00000000000000000944200300000000067766bf500003000000033f0000000f3ee00
00000000fee311eeee11333eee113eef011e11111111e110440000001010000000000000000000440030000000007766bfff00003e00000000e3ff3eeee00300
0040400033e1e11111111331111e1e330101110110111010400000000e10010000000000094400220000000000067766d66f5000030000000030000e00000e00
00444440ee33eeee111e1111eeee33ee0000100000010000000000000110e0000000000000044420000000000006666d66ddd5000e3000000000000300000000
002002000eeeeeeeeeeeeeeeeeeeeee000000000000000000000000001101000000000000000244400000000006d66d66ddddd0000e300000000000000000000
04444400444442444444244444244444001e3dc770000000000000077cd3e1001000000000000000000000000066dd666d566d50000e30000000000000000000
00200200224221222222122222122222101e3eddd00000000000000ddde3e10111000000000000000090000000666666dd566310000ee3b00000000000000000
004024000040244000000000000011001ee13eee0000000000000000eee31ee101110000000000010040009000d66666d5163310000e00e3b000000000000000
004440000044400000000000000002200ee1ee3f0000000000000000f3ee1ee000111100000001110440004200dd666dd5153110000300e0ebb3000000000000
0420200004202000000000000000004401133e33000000000000000033e331100010011111111100240090020dffddddd1111111000300300bee33e000000003
00404000004040000000000000000004113333fb0000000000000000bf3333110010000010010000440040400ff66ddd51155511000e000003000eeeb3bb33ee
004444400444444000000000000000001133effb0000000000000000bffe33110000000010000000422442200f6666dd1155551100000000030000000eeee300
00200200002002000000000000000000011ee3fb0000000000000000bf3ee1100000000000000000402422040d6666dd11551111000000000e0000000e000000
0000000000000000000000000000000000406a0000000a00000000000000000000000000000000a000a0000000a000a000000a0a000a00a00000000000000000
00004000000000000000400000000000074700000004060000040000000000000000000000a04060007040a0007040600000470600074060000040000000e000
000746000000400000074600000040007777600000746000077760000000000000000000007776600077766000774660000747600007460000774600000fe300
00777600000776000077760000774600a076d50007776500777606000000000000000000007776000007766000077600000776000007760007077660003ff300
00766600000776000076660007077600000d05000776d500776000a0000000000000040000076600000766000006660000076650000766000a07660a003f3300
00add50000076a0000add5000a0766a00000d2000a0d0200add55000000000000006760000ddd500000dd550000dd500000dd550000dd550000dd500003dd500
000d0500000dd550000d0500000dd50000000200000d000000d0020005d7760000d7d50000200500000d0020000d0500000d0020000d0002002d0050000d0500
000202000020002000020200000220000000000000020000002000002dd6a640002ad5a0000002000002000000020200000200000020000000000020000e0e00
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000990000000f3e0000331002222222200000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000994400000fee3000e10e102227722200000000
000000000000000000000000000000000000000000000000008000000080000000094400000000000000000000944400003e0030000001e02277772200000000
00000000000000000009800000888800089988800009880000000080000000000099944000944400000000000999944008281030000000e02777777200000000
0000000000000000000980000009800000000000008880000008800000000800094444400999444000999440092dd24008881f30000003e02227722200000000
0000000000098000000880000000000000000000000000000800000000000000042dd240094444449994444400466400028203e000000e102227722200000000
089988800088880000080000000000000000000000000000000000000000000000466400042dd240422dd224006660000030fe0000e031002222222200000000
000000000000000000000000000000000000000000000000000000000000000000666000006664000466644000666000000e3e000001e1002227722200000000
00020000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
04444200049994000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002120000
0020200000c7c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000033000000300000000000002220000
0020200000c7c0000000000000000000000448480000000000000000000000000000000000000000000004000000030000003e00003ee0000003000001210000
044442000499940000000000004484800444442000000000000000000000000000009900000000000004420000033e000000e00000e000000033000000000000
00020000000200000044848004444400444444440000000000000000000000000004444000000000000020000000e0000000000000000000000ee00000000000
000400000004000004444400044442000000000000000000000000000000000000045d2000000000000000000000000000000000000000000000000000000000
00040000000400004444444004204200000000000000000000000000000000000000266000000000000000000000000000000000000000000000000000000000
000c0000000000000000000000000000000e33e0000ee3ee00ee33e000ee33e00ee333ee00000000000500000000000000000000000000000777000000000000
00070000000c000000050000000100000f00f3000000ff00000bf000000ffe0000000000000c000000000000000000000000c000077700007575700008281000
00070000000c0000000d00000000000000b0bf000000bf000000f3000000000000000000000000000000c0000000c00000000000757570007757700008881000
0007000000000000000000000000000000f0bf0000f00b00000000000000000000000000000cc000000c700000000000000c0000775770007575700002820000
000000000000000000000000000000000bf0f000000f00f000000000000000000000000000c77c0000c77c00000cc0000007c00075757000d777d00000000000
000000000000000000000000000000000bf00f0000bf0000000b0000000000000000000000c77c0000c77c0000c77c0000c77c00077700000ddd000000000000
000000000000000000000000000000000ff300000bff00000bff00000000000000000000000cc000000cc00000c77c0000c77c00000000000000000000000000
000000000000000000000000000000003f33000033f330003fff33003fbff3003fbff3000000000000000000000cc000000cc000000000000000000000000000
000000000000000000000000001010000000000000000000000c00001d66d111efbbfee0666d666dbbffff6d66d6666d01111111111111100000000000000000
00000000000000000000000000010000000000000000000000c7c000d6655511fbb333ee6de5ddd5633335d56d5dddd577c7ccccccccdcddcccccccc00000000
000000000066660000000000000000000000000000000000000c0000dddd5511ffff33ee635d66df6dee36d56d1556d501111111111111100000000000000000
000000000fdd5500000000000010100000000000000000000000b007d5551110f333eee06edd66f56ddd66d56557c6d177c7ccccccccdcddcccccccc00000000
00000006f3766666600000000001000000000000000000000000b0b00d1111000feeee006566df556d66ddd5dd5cc65501111111111111100000000000000000
0000000d35ddd5d55000000001101100000000000000000073003b00066dd5100bbff3e0ed66d3d36d66dd356d666dd577c7ccccccccdcddcccccccc00000000
0000006663666666660000000011100000000000076d000000b03300ddd55510fff333e06dddd53e6dddd33e6ddd5dd501111111111111100000000000000000
000000dd3ddddd5d5500000000010000000000006d76d000003e3300d5511110f33eeee0d5553ee3d555eeeed555155577c7ccccccccdcddcccccccc00000000
00000005e110011150000000000000000000000666ddd0000000000006dd55100bff33e0666d666d9944446d00000cccccd00000000000cd5d00000000000000
0000000d31000011d000000000000000000000656666d00000070000ddd55551fff3333e6d15ddd5622225d5000cccccccccd00000000c0000d0000000000000
00660006100000016000000000100000000006555666d00000030000d5111111f3eeeeee625d66d46d1126d500c777cccccccd0000007000000d000000000000
00d500f6100000016300000001101001000065111646d0000000b000516dd5103ebff3e061dd66456ddd66d50c77777ccccccdd0000c00000000d00000000000
0666d03d1000000fd0f0000011010010000d6711666dd0000000b0b01666d550ebbbf3306566d4556d66ddd50c77777cccccccd0000c00000000d00000000000
00d500063000000360000000011010010025d666686dd04003003b001d6d5551efbf333e1d66d2d26d66dd25cc77777cccccccdd000d00000000500000000000
0666d006e1000011f000d50000100000044d5d6666dd594200b03300dd551111ff33eeee6dddd5216dddd221ccc777ccccccccdd000d00000000500000000000
00d5003d11100111d30d550000000000ff22d543ddd54422003e3300d5116d55f3eebf33d5552112d5551111ccccccccccccccdd000d00000000500000000000
3bbf3d6666d66666666f3bbb000000003bbf3225354f3bbb00000000516ddd513ebfff3e0c00000000000000ccccccccccccccdd000d00000000500000000000
eff33f5ddd5dd33dd5f33fff00000100eff33fffeff33fff000000001dd55551eff3333e0c00700c07ccccd0ccccccccccccccdd000d00000000500000000000
33ddd3f3666666de33eee3f30001111033eee3f333eee3f3000000001d511111ef3eeeee00cc7cc000000000dccccccccccccddd000d00000000500000000000
336663ee35ddddee333e33ee00100100333e33ee333e33ee00007000d516d510f3ebf3e000077700000000000ccccccccccccdd0000c00000000d00000000000
ee1dd33eee11333eee11333e01000000ee11333eee11333e0000b000516dd5513ebff33e00077700000000000dccccccccccddd0000c00000000d00000000000
11e1133111ee133111ee13310101110011ee133111ee13310000bb001ddd5551efff333e0007cc000000000000ddccccccdddd0000007000000d000000000000
00ee111100ee111100ee11110101110000ee111100ee111100303b001d555510ef3333e000cc00c000000000000dddddddddd00000000c0000d0000000000000
0110011001100110011001100101110001100110011001100ebe33e00511110003eeee00000000c00000000000000dddddd00000000000cd5d00000000000000
01011100000000000000011100000000101000100100010100000000000000000000000003000000000000000000077700077700077700077700077700770000
0000001000111000010001110000000010100000010000010000000000000000000000000b003003000000000000775770775770775770775770775770777700
01111001011011001110111100000000101000100100010100000000000000000000000000bb3ff0000000000000550777750557750557750777750777755000
110011010100011001000111000000000010001001000101000000000000000000000000000bbf00000000000007777757777707700007777707707757700000
110111010010011001000111000000001010001000000101000030000000000000000000000bff00000000000077557700557777500077555007507777500000
1100100100001100010001110000000010100010010001010000b000000000000000000000033e00000000000077077577077577077077077077077577077000
01100010000111000100111100000000100000100100010000eebe000000f0000000000000e300e0000000000057777057775057775057775077077057775000
0011110000111110000001110000000010100010010001010e3e33e0e33fb3e0e3fff3e0000000e007ccccd00005550005550005550005550055055005550000
d666666d66666666d666666d00000000000000000000000000000000000000000000000000000000000000000000000002222dc7000000000000004000000000
5d66d515dd66ddd5515d66d5000000000000000000050000000000000000000000000000000000000000000000000000224444dd000000000000042000000000
05dd5111515ddd111115dd500000000000050000000c000000000000000000000000000000000000000000000000000021244200000000000004040000000000
0155dd551555511555dd5510000d0000005c500005c7c50000000000000000000000000000000000000000000000000044422100000040000000420000000000
00515dd1011155511dd515000000000000050000000c00000000d0d000c000000000000000000000000000000000000042211000004420000000400000000000
00111510000151100151110000000000000000000005000000000700000000000000000000000000000000000000000022110000002420000000400000000000
005ddd100001011001ddd5000000000000000000000000000000d0d0000000000000000000000000000000000000000000000000000442000004200000049940
05ddd51000000000015ddd5000000000000000000000000000000000000000000000000000000000000000000000000000000000244442200004200004999994
05ddd55505500000015dddd5cccccccc01001010ccccccccc7c77777cc7ccccc000000000000000099994bbb9999999900222100499999949999999949999994
05dddd11555550000515dd500000000001001010c11c1111c11c77c11c11000c000010000000000042443fff4499444200011000249942124499444221249942
055d5515005510001ddd55100000000001001010c11c111c11c77c11c111000c00010100000000002e2ee3f32124441100000000024421112124441111124420
5555555100011000dd5515000000000000101010c11c11c11c77c11c1111000c001000100000000021ee33ee1222211200000000012244221222211222442210
5dddd51000010000555dd1000000000000011010c11c1c11c77c11c11111000c0010001000000000e111333e0111000100000000002124410111222114421200
05dd51500055551011dddd500000000000010010c11cc11c77c11c111111000c010100100000000011ee13310000000000000000001112100001211001211100
0155ddd1000551005155d55000000000000111107cc711c77c11c1111111000c100010100000000000ee11110000000000000000002444100001011001444200
005155dd00001000155555550000000000000000c11c1c77c11c11111111000d1000101000000000011001100000000000000000024442100000000001244420
055d5555dddd555555555500cc7cc7cc00000000c117c77c11c111111111001ccccccc7c77777ccc000000000000122222210000024442220121000001244442
00ddd55d5d5155555ddd550000500500000000007cc777c11c1111111111010cc11c1c11c77c10cc000000000002224444222000024444111222221002124420
00dddd555511dddd51dddd0000d00d000000000077777c11c11111111111100dc11cc11c77c11c0c000000000012244444422100022422120012210014442210
000dd155151555d15551110000c00c00000110007777c11c111111111110001dc11711c77c11c00c000000000122214224122210222222210000000044221200
0005511511115551555511000c7cc7c0000101007cc711c1111111111101011d7ccc1c77c11c100c000000000012111221112100244442100001122122244100
0000110501001511151110000050050001110010c1171c11111111111011111dc11cc77c11c1100c000000001244211221124421024421200012222211444420
00000000000000001110000000d00d0001010010c11cc111111111110110111cc11c77c11c11100c001100002144212222124412012244410000121121224220
00000000000000000110000000c00c00010100107cc71111111111101100110c7cc77c11c111100c122211102112222112222112002122440000000012222222
0055510000000000000000000c7cc7c0ccccc77cc11c1111111111011000100d777cc11c1111100d0000000002222dc77cd22220000422224444222222222200
00011000000000000000000000500500c1c1771cc11c1111111110110000001c777c11c11111101d00000000224444dddd444422004442242421222224442200
00000000000000000000000000d00d00c1c7711cc11c1111111101100001010c7cc71c111111111c000000002124420000244212004444222211444421444400
00000000000000000000000000c00c007c77111dc11c1111111011000011100cc11cc1111111010c000000004442210000122444000441221212224122211100
0000000000000000000000000c7cc7c07c71110dc11c1111110110000110000c7ccc11111110000c000000004221200000021224000221121111222122221100
00000000000000000000000000500500c1c1100cc11c1111101100001101000cc11c11111100100c000000002244100000014422000011020100121112111000
00000000000000000000000000d00d00c1c1001cc11c1111011000011011000cc11c11111001100c000000001444420000244441000000000000000011100000
00000000000000000000000000c00c00cccddccccccccccdccddddccdcccccccccccccccddcccccc000000001224220000224221000000000000000001100000
__map__
ebfefefeeceb99feff0000000000edeeeeef0000000000000000000000edeeee000013000000000000000000000000000000000000000000000000000000000011131e0e0000000f00681d0000000000000000000000001116231b000000000000000000000000e0e1e2000000000000000000000000000000000000000000d0
ef200000edef0000000060cf0000ed00eeed00cf000000000000000000ef00ee0000131e00000000000000000000000000000000000000002b2c00000000000011130000001f01080808092d00001c002700000000000021231b00000000791c0000000000000000000000000000000000000000000000c1c2000000008300d2
ef319a00fdff00000000dddf0000efeeeeef00dddf0000000000000000fcee00001623000000000000008a2d0000000f000000000000001d3b3c0c000000000011130c790f0021231b0d003d3e3f0708080809000000000d00001d0000010202030c1d0000c00000000000000000000000000000c1000000f0000000808182d0
ef30ed0000b200000036fcef0036fcee00fb00edef0000000000000000edee0000130d00000000000000873d3e3f070808091e00000001a0a1a20300000000002123080801030000005000000000000e000d000000000000001f01032d2122061308091e00d0c20000600000c000000000c20000f000000000000060909192d0
ef30ef00808182000000fcef0029edecebef36fcef2632323232320036fc00ee16230000790000000058970000000d0e0000000000002122222223000000581c000f0e0011132f010202030000001d000f000000000060270f0021233d3e3f21231b000000e0c0c1c1c20000f000000000f0000000000000005800c0c1c18bc1
ef30edcd909192cfce00edef0000fdfefecc35efef0000000000000000ed00ee1300000032183389a103a700000f0000681c000000001f11131b00580000070808093839111338111200131e00010202030000580000010203001a0d0000000e0d0000000000d0d1d2e2000000c20000000000c20000000000c0c1c2d1000000
ef30fddddede8bdedbdedffb350000000000cfedff0000000000000036fceeee231e00000000008b122403383901020202030c2700000011133839870000000d0000200b21232e110012133a3a111212133a3a8a3a3a1100130c2a002050001d000050581d68d000d000000000f000c0c23a3ad03a3a3a3a3ad0d1f08b0000d1
ef3000fdfefefeec00eedced3a3adddedededeef000000000000000000fdfeff0000000000000011000013001f1100000024020300000011132e2fa70000000000323101031b00212222230402212222230204020204111224020203313201020202020202020225d23a3a3a3a3a3ad0c0c1c1c1c1c1c1c1c1c1c20000d10000
ef300000000000ef00eeebfefefefefefefefeff0000000000000000000000000000000000001f111200132e2f212206000000132d001f1113000000000000000000301113000000000d00000000000000000000001f212222222223301f21060000001622220600c1c1c1c1c1c1c1e7f6f7ad8c8daef5f6f400000000000000
dddedfcf000000edebfeff00000000000000000000000000000000000000000000000000000000110012131e000a0e11000012133d3e3f21231e00001d0068000f1c3008231e001c1d00000000000000000000000000000f1c000d0030000a11162222232d0e210600000000000000f7b400008c8d0000b5d500001010100000
eeeededd000000edef0000000000790000000000000000000000000000000000000000000000002122222300001a0011121622231e00000000000007093a01020202031b3d3e3f010202031e000000000000000000000102030c000030001a11131b0d003d3e3f1100101010101000d7b40000aaaa0000b5e500101000101000
efff00dc000058efef00000000009a0000000000000000000000000000000000000000000000002a0e000d00001a1f2122230d000000000f0060000d070921222222230f791c68212222230900000000000001033a3a11002403000000002a21231e002b2c2a001100000010001000e7b400009b9c0000b5f500001010100000
ef00000000009aedef0000000000000000000000000000000000000000791c1d000000000000000000790000852a0000000e000000000b0102030c0000000e000d0e0708080808090e000d0000006000000b11240204251200131c501d580f747400273b3c791d1100000010101000f7b40000abac0000b5d500101000101000
ed000000000000eddedf00000000000000000000000000000000003301a0a28a030c60000000000f1d1c4094950f000000001c68581c010316230900000000000000001d0d000f00001c0000000001a0a1a21100120000001224020202020202020202020202022500000000000000d7b4b700baba0000b5e500001010100000
ef200000990000edeeff00000020cf00000000000000000000000000111289002402032632330102020202a4a5030c1c270b010202021413132000000050000f000f0b010202020202030c000020111212001400001200000000001200000000120000120000001200101010101000e7e3f4008c8d00e8e9f500000000000000
ef31003a873a3aedef0000003331260000000000000000000000001f110012000000131e000011120000001200240202020225001212121513310102020202020202022500120000122402033231111200000012000000120000000000001200000000000012000000000000000000f7f3009d8c8d9ef8f9f4f4f40000000000
ef3000fdfefeffedef0000000030000000000000000000000000000011120000120013b400b51100131b000d0e000000000000930000008913301100000000000000000016222206001216231e30111200001622222206001216222222222222222222222222220600101010101000d7f300000000000000000000c500000000
ef300000000000efef0000000099000000000000000000000000000011000012000013b400b5111213000000000000000000808182001f11133011000012000000168922230a1f1100121300003021222222230d1a0e210600131b000000747474747474740f0d1100100000001000e7f300c50000c600d5d6d700000000d800
dbdf0000cf0000edfb3500000000000000000000000000000000000011001200001213b45eb51100131e0000000027680060909192000011133011000000000016230e00001a00212222232d00000074747474002a0000111234350000010202020202020203363700100000001000e7f3000000000000e5e6e70000c500f400
00ef3a00990000effb0000000000000000000000000000000000000021222222222223b400b5212223000000000001028b02a0a1030036371330111200000000130d0000002a000e1a0e0d3d3e010202080808092d001f111234000000111200162222222223363700000000000000f7f30000c7c50000f5f6f70000000000c5
00edff00000000edfb350000000000000000000000000000000000000d00000f1d001cb400b568000f1c0000001f111216222222231e363713301100000012001300a3000000001c2a0f1c1d0b111200131b0d003d3e3f212234350000370000131b505050270b1100101010101000e8d7c50000000000d40000f40000000000
00ef00000000dddefb0000000000000000000000000000000000000000dddede020203b400b50102020300000000110013190e0d0000363713301100000000008a808182000000010202020202111200131e0000005800000000000036370012133907080808081100100000001000f8e700e40000000000c500000000e40000
00ef209a3a3aedeefb3500000000200000000000000000000000000020ed0000120015b400b5111200133a3a3a3a11121300001c279a36371330110012000000139091921c0f0b89120012000014000013201d600fc0c2000000000036370000130c0f001c00001100101010101000e7f7e8e90000c5000000c7000000d3e300
ebff31dddedbdf00ef0000000033310000000000000000000000000031fdec00001200b400b514000024020202022500343500078a002911133011000000000015a0a1a28b020214001200000000000013310102a0a1c1c0c1c200001f111200240202020203363700000000000000f700f8f900000000000000000000c5f300
ef0030dcedeeebfeff000000000030000000000000000000000000003000ed00000016222222222222222397212222063435000e000000111330111622222222222222222222061200138721222222061330212222222206d1d200000011001216222222222336370013c700000000000000c5000000000000000000c600f300
ef003000fdfeff0000000000000030000000000000000000000000003000ef000012131b0e000f74740000a70e0a1f113435000000000011133011131b0d000000000e000f1f21222323871b00000d111330747474000e1100d0000000111200131b000e0000363712130000c50000c7c60000000000c7000000c5000000f300
ef6030cf0000000000000000cf0030000000000000000000000000003232dd0000001300001f010202030000001a00212326320089003637133021231e1c600f000000008700000e1c00872e2f872d11248a020203893911d1d2000000111200131e00008a003637162300000000c60000e40000c5000000000000c70000f400
dddededf000000000000009926323200000000cfce000000000000000000ed001216232d0036370016231e00892a000d000000000000363713300e0a00010202032d001f97383907091ea73839973d2122222222231b001100d00000001100123435003a973a3a11131b000000c700d5d6d700000000d5d6d700000000000000
ed00eeef0000000000000000000000000000dddedbdf0000000000000058ef0000131b3d3e3f1112131b00000d00000f2700000000001f111330001a1f110000133d3e3fa70000000d001a0000a700000e000db10000008b00d2000000110000132e2f070808091113c5000000d800e5e6e700c50000e5e6e7d80000c7f400c6
dcee00ed58ce000000000000000000000000efee00efcf0000cdcf00dddbdbdb22231e0000001100130000000000000709008a00000000111330002a00110000131e58002a000000001c2a5800a71d000000808182005811d1d23a3a3a1112003435000000000d2123000000e8e900f5f6f700000000f5f6f7e8e90000d40000
0000dddededf00ea680058000000cfea00dddf00eeefdbdbdededf00dc600000cf0d1c0f27581112133a583a3a3a3a3a3a3a3a3a3a583a1113301d0058110000133a973a3a583a3a3a873a973a01030c0f1d9091920b012500c0c1c1c1c20000133a3a890c00600f000000c5f8f900d4c700000000c5d4c600f8f90000000000
0000dcee00dddedbdedbdededbdededbdedfdc0000ed000000dddedbdededededbdede01020225002402020202020202020202020202022524020202022500002403a7010202020203a7010203141501028ba0a1a202250000f0120000f000122402020202020202032600c7000000c50000c500c70000000000c7000000c500
__gff__
0001010101010101010100000000000001010001010101000208000000000000000101010101020000080000000000000406020211000011000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000001000101010000000000000000000000010001010000000000010101000101000100000000000000000000000000000000000000000000000001010100000000000000000011000000010101020001010100000101000101010101010600010101010100010101010100000004010101010101001111010101
__sfx__
310c0000025001d000137000e000157001300018700150001a700180001d7001a0000e0001d000130000e000150001300018000150001a000180001d0001a0000000000000000000000000000000000000000000
0110000c025551d010137550e010157551301018755150101a755180101d7551a0100e0001d000130000e000150001300018000150001a000180001d0001a0000000000000000000000000000000000000000000
0110000c035551d010137550f010157551301018755150101a755180101d7551a010035001d000137000f000150001300018000150001a000180001d0001a0000000000000000000000000000000000000000000
011000182655026510265101d00029550295102951000000285502851028510000002455024510245100000000000000000000000000000000000000000000000000000000000000000000000000000000000000
011000001a010035151d010137150f010157151301018715150101a715180101d7151a000035001d000137000f000150001300018000150001a000180001d0001a00000000000000000000000000000000000000
010c00001a7401a7201a7101a7101c7401c7201c7101c7101d7401d7201d7101d7102474024720247102471028740287202871028710267402672026710267102174021720217102171024740247202471024710
010c0000237402372023710237101f7401f7201f7101f710217402172021710217101c7401c7201c7101c7101d7401d7201d7101d7101f7401f7201f7101f710187401872018710187101c7401c7201c7101c710
010c00001a7501a7301a7201a7101c7001c7001c7001c7001a7201a7101a7101a7002470024700247002870013750137301372013710267002670026700217001372013710137101370024700247002470000000
010c00001a7501a7301a7201a7101c7001c7001c7001c7001a7201a7101a7101a700247002470024700287001f7501f7301f7201f710267002670026700217001f7201f7101f7101370024700247002470000000
010c000032535320003200530305305350000032000000002b5250000030000000002d52500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
010c000032535003000030030305305350000032000000002b5250000030000000002d52500000000000000028515000000000000000295150000000000000002851500000000000000024515000000000000000
010c00001a7401a7201a7101a7101c7401c7201c7101c7101d7401d7201d7101d7102474024720247102471028740287202871028710267402672026710267102b7402b7202b7102b71029740297202971029710
010c000028740287202871028710267402672026710267102474024720247102471023740237202371023710217402172021710217101a7401a7201a7101a7102174021720217102171026740267202671026710
010c00002b7502b7302b7202b7101c7001c7001c7001c7002b7202b7102b7101a7002470024700247002870024750247302472024710267002670026700217002472024710247101370024700247002470000000
010c0000297502973029720297101c7001c7001c7001c7002972029710297101a7002470024700247002870022750227302272022710267002670026700217002272022710227101370024700247002470000000
0110000c07755110101575513010167551301018755150101a75518010117551a0100e0001d000130000e000150001300018000150001a000180001d0001a0000000000000000000000000000000000000000000
0110000c0275518010107550e01011755100101375511010157551301018755150100e0001d000130000e000150001300018000150001a000180001d0001a0000000000000000000000000000000000000000000
0110000c08755160100a755080100c7550a0100f7550c010147550f01016755140100a5001d000130000e000150001300018000150001a000180001d0001a0000000000000000000000000000000000000000000
0110000c007551301007755000100c755070100e7550c0100f7550e010137550f0100a5001d000130000e000150001300018000150001a000180001d0001a0000000000000000000000000000000000000000000
0110000c005551b010117550c0101375511010167551301018755160101b755180100c0001b000110000c0001300011000160001300018000160001b000180000000000000000000000000000000000000000000
010c0000130361a0361d03621036130261a0261d02621026130161a0161d01621016130161a0161d01621016130361a0361d03622036130261a0261d02622026130161a0161d01622016130161a0161d01622016
010c0000130361a0362103624036130261a0262102624026130161a0162101624016130161a0162101624016130361a0362203626036130261a0262202626026130161a0162201626016130161a0162201626016
010c00001d0362103626036290361d0262102626026290261d0162101626016290161d016210162601629016150361c0361d03621036150261c0261d01621016150161c0161d01621016150161c0161d01621016
010c0000150261a0261c0261d026150161a0161c0161d016150161a0161c0161d016150161a0161c0161d0160e02615026180261c0260e01615016180161c0160e01615016180161c0160e01615016180161c016
010c00001403616036180361b0361402616026180261b0261401616016180161b0161401616016180161b01614036180361b0362003614026180261b0162001614016180161b0162001614016180161b01620016
010c0000180361b0362003622036180261b0262002622026180161b0162001622016180161b016200162201618036200362403627036180262002624016270161801620016240162701618016200162401627016
010c00001b0361f03624036270361b0261f02624026270261b0161f01624016270161b0161f0162401627016180361b0361f03624036180261b0261f02624026180161b0161f01624016180161b0161f01624016
010c0000180361a0361b03622036180261a0261b02622026180161a0161b01622016180161a0161b0162201616036180361b0361f03616026180261b0261f02616016180161b0161f01616016180161b0161f016
0110000c0a755180100c7550a0100e7550c010117550e010167551101018755160100c5001f000150001000017000150001a000170001c0001a0001f0001c0000200002000020000200002000020000200002000
010c00001a0361d03622036260361a0261d02622026260261a0161d01622016260161a0161d01622016260161a0361b0361d036220361a0261b0261d016220161a0161b0161d016220161a0161b0161d01622016
010c00001102616026180261d0261101616016180161d0161101616016180161d0161101616016180161d0160c0160e01611016160160c0160e01611016160160c0160e01611016160160c0160e0161101616016
011000002953229512295120050028532285122851200500245322451224512005002653226512265122651226512265122651226512265122651226512265120000000000000000000000000000000000000000
011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000265322651228532285120000000000000000000000000000000000000000
011000002953229512295120050028532285122851200500245322451224512005002153221512215122151221512215122151221512215122151221512215120000000000000000000000000000000000000000
011000002c5322c5122c512005002b5322b5122b51200500275322751227512005002453224512245122451224512245122451224512245122451224512245120000000000000000000000000000000000000000
011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b5321b512205322051224532245120000000000000000000000000000000000000000
0110000026532265122651200500245322451224512005002b5322b5122b512005002653226512265122651226512265122651226512265122651226512265120000000000000000000000000000000000000000
011000002953229512295120050028532285122851200500295322951229512005003053230512305123051230512305123051230512305123051230512305120000000000000000000000000000000000000000
0110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002d5322d51230532305120000000000000000000000000000000000000000
0110000032532325123251200500305323051230512005002e5322e5122e512005002753227512275122751227512275122751227512275122751227512275120000000000000000000000000000000000000000
011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002453224512265322651227532275120000000000000000000000000000000000000000
0110000029532295122951200500225322251222512005001d5321d5121d512005002253222512225122251222512225122251222512225122251222512225120000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0204000023620286302d640306403364034640356403564033640306402e6402b64025640206401d6401a6401764013640106400e6300d6300b6200a610096100761005610046100361003610026100261002610
000400000875016750000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
010100000c7501075012750160501705017050190501a0501b0501d0401f030200102600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00010000103201d610146001d600283201d330082301b600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000200000533004330073300a3300e3301133014330153300633005320073200a3200d3200f320103200631004310093100d31010310160001c000220001f0000460006600087000a2000b2000c2000e20011000
00030000170101c5201f7402175022750185501d550215502655029550170301c5301f7302173022730185301d530215302653029530170101c5101f7102171022710185101d5102151026510295102340022400
000200001961013310126200e320196300a3300b3500e650123501265017340186401f3400a6401533015630123300d6300d3200c320096200f3200a610173100b6101f310096101231007610113100361006310
01010000053703c2702d370142603625028340132401b2500f2500c250122400764005440034300263001430053303c2302d330142203621028310132101b2200f2200c220122200761005410034100261001410
00020000173100c310113101b3201f320044200161003600016000060000000000000000000000000000000000000256000000000000000000000000000000000000000000000000000000000000000000000000
000100002061018620006002f33025310203100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0102000039060313602e060273601f06019360137600b760077600476002760017600076036060290302003016030100300a0300903020010110100b010050100201000010000500000000000000000000000000
0001000000670076702b5502704023040200401c740187402855025550210501d030167300e7301f5401d5401904016020130200e72005720175301553013030110300e0100771000710111000a1000710004100
0008000004074070740b0740f0741307404064070640b0640f0641306404054070540b0540f0541305404044070440b0340f0341303404024070240b0240f0141301404014070140b0140f014130140400407004
__music__
01 01000044
00 01000044
00 02000044
00 02000044
00 01090044
00 010a0044
00 02090044
00 020a0044
00 01050944
00 01060a44
00 02070944
00 02080a44
00 010b0944
00 010c0a44
00 020d0944
00 020e0a44
00 0f141f44
00 0f152044
00 10162144
00 10170044
00 11182244
00 11192344
00 121a2444
00 121b0044
00 0f141f44
00 0f152044
00 10162544
00 10172644
00 11182744
00 11192844
00 1c1d2944
02 1c1e4344
`;function t(e){let t={},n=null;for(let r of e.split(/\r?\n/)){let e=r.match(/^__(\w+)__$/);e?n=t[e[1]]=[]:n&&n.push(r)}return t}function n(e){let t=[];for(let n=0;n+1<e.length;n+=2)t.push(parseInt(e.substr(n,2),16));return t}function r(e){let t=new Uint8Array(16384);return e.slice(0,128).forEach((e,n)=>{for(let r=0;r<128&&r<e.length;r++)t[n*128+r]=parseInt(e[r],16)}),t}function i(e){let t=new Uint8Array(4096);return e.slice(0,32).forEach((e,r)=>{n(e).slice(0,128).forEach((e,n)=>{t[r*128+n]=e})}),t}function a(e){let t=new Uint8Array(256);return n(e.join(``)).slice(0,256).forEach((e,n)=>{t[n]=e}),t}function o(e){let t=[];for(let r=0;r<64;r++){let i=e[r]||``,[a=0,o=0,s=0,c=0]=n(i.substr(0,8)),l=[];for(let e=0;e<32;e++){let t=parseInt(i.substr(8+e*5,5),16)||0;l.push({key:t>>12&63,instrument:t>>8&7,custom:t>>11&1,volume:t>>4&7,effect:t&7})}t.push({filters:a,speed:o,loopStart:s,loopEnd:c,notes:l})}return t}function s(e){let t=[];for(let r=0;r<64;r++){let i=(e[r]||``).match(/^([0-9a-f]{2}) ([0-9a-f]{8})$/);if(i){let e=parseInt(i[1],16);t.push({start:!!(e&1),loop:!!(e&2),stop:!!(e&4),channels:n(i[2])})}else t.push({start:!1,loop:!1,stop:!1,channels:[65,66,67,68]})}return t}function c(e){let n=t(e);return{gfx:r(n.gfx||[]),map:i(n.map||[]),flags:a(n.gff||[]),sfx:o(n.sfx||[]),music:s(n.music||[])}}var l=`000000090012001b0025002e0037004000490052005b0064006e0077008000890092009b00a400ae00b700c000c900d200db00e400ed00f7010001090112011b0124012d0136014001490152015b0164016d0176018001890192019b01a401ad01b601bf01c901d201db01e401ed01f601ff02080212021b0224022d0236023f02480251025b0264026d0276027f02880291029a02a402ad02b602bf02c802d102da02e302ed02f602ff03080311031a0323032c0335033f03480351035a0363036c0375037e03880391039a03a303ac03b503be03c703d003da03e303ec03f503fe0407041004190422042c0435043e0447045004590462046b0474047d04870490049904a204ab04b404bd04c604cf04d904e204eb04f404fd0506050f05180521052a0533053d0546054f05580561056a0573057c0585058e059705a105aa05b305bc05c505ce05d705e005e905f205fb0604060e0617062006290632063b0644064d0656065f06680671067a0684068d0696069f06a806b106ba06c306cc06d506de06e706f006f90702070c0715071e0727073007390742074b0754075d0766076f07780781078a0793079c07a507ae07b807c107ca07d307dc07e507ee07f7080008090812081b0824082d0836083f08480851085a0863086c0875087e08870890089908a208ab08b408bd08c708d008d908e208eb08f408fd0906090f09180921092a0933093c0945094e0957096009690972097b0984098d0996099f09a809b109ba09c309cc09d509de09e709f009f90a020a0b0a140a1d0a260a2f0a380a410a490a520a5b0a640a6d0a760a7f0a880a910a9a0aa30aac0ab50abe0ac70ad00ad90ae20aeb0af40afd0b060b0f0b180b210b2a0b330b3b0b440b4d0b560b5f0b680b710b7a0b830b8c0b950b9e0ba70bb00bb90bc20bca0bd30bdc0be50bee0bf70c000c090c120c1b0c240c2d0c360c3e0c470c500c590c620c6b0c740c7d0c860c8f0c970ca00ca90cb20cbb0cc40ccd0cd60cdf0ce80cf00cf90d020d0b0d140d1d0d260d2f0d370d400d490d520d5b0d640d6d0d760d7e0d870d900d990da20dab0db40dbc0dc50dce0dd70de00de90df20dfa0e030e0c0e150e1e0e270e2f0e380e410e4a0e530e5c0e640e6d0e760e7f0e880e900e990ea20eab0eb40ebd0ec50ece0ed70ee00ee90ef10efa0f030f0c0f150f1d0f260f2f0f380f410f490f520f5b0f640f6c0f750f7e0f870f900f980fa10faa0fb30fbb0fc40fcd0fd60fde0fe70ff00ff91001100a1013101c1024102d1036103f1047105010591062106a1073107c1085108d1096109f10a710b010b910c210ca10d310dc10e410ed10f610ff1107111011191121112a1133113b1144114d1155115e1167116f11781181118a1192119b11a411ac11b511be11c611cf11d711e011e911f111fa1203120b1214121d1225122e1237123f1248125012591262126a1273127c1284128d1295129e12a712af12b812c012c912d212da12e312eb12f412fd1305130e1316131f1328133013391341134a1352135b1364136c1375137d1386138e139713a013a813b113b913c213ca13d313db13e413ec13f513fd1406140e141714201428143114391442144a1453145b1464146c1475147d1486148e1497149f14a814b014b914c114ca14d214da14e314eb14f414fc1505150d1516151e1527152f153815401548155115591562156a1573157b1583158c1594159d15a515ae15b615be15c715cf15d815e015e815f115f91602160a1612161b1623162c1634163c1645164d1655165e1666166f1677167f16881690169816a116a916b116ba16c216ca16d316db16e316ec16f416fc1705170d1715171e1726172e1737173f1747174f175817601768177117791781178a1792179a17a217ab17b317bb17c317cc17d417dc17e417ed17f517fd1805180e1816181e1826182f1837183f1847185018581860186818701879188118891891189918a218aa18b218ba18c218cb18d318db18e318eb18f318fc1904190c1914191c1924192c1935193d1945194d1955195d1965196e1976197e1986198e1996199e19a619af19b719bf19c719cf19d719df19e719ef19f719ff1a081a101a181a201a281a301a381a401a481a501a581a601a681a701a781a801a881a901a981aa01aa81ab11ab91ac11ac91ad11ad91ae11ae91af11af91b011b091b101b181b201b281b301b381b401b481b501b581b601b681b701b781b801b881b901b981ba01ba81bb01bb71bbf1bc71bcf1bd71bdf1be71bef1bf71bff1c071c0e1c161c1e1c261c2e1c361c3e1c461c4d1c551c5d1c651c6d1c751c7d1c841c8c1c941c9c1ca41cac1cb31cbb1cc31ccb1cd31cdb1ce21cea1cf21cfa1d021d091d111d191d211d281d301d381d401d481d4f1d571d5f1d671d6e1d761d7e1d861d8d1d951d9d1da41dac1db41dbc1dc31dcb1dd31ddb1de21dea1df21df91e011e091e101e181e201e271e2f1e371e3e1e461e4e1e551e5d1e651e6c1e741e7c1e831e8b1e931e9a1ea21ea91eb11eb91ec01ec81ecf1ed71edf1ee61eee1ef51efd1f051f0c1f141f1b1f231f2a1f321f3a1f411f491f501f581f5f1f671f6e1f761f7d1f851f8c1f941f9b1fa31faa1fb21fb91fc11fc81fd01fd71fdf1fe61fee1ff51ffd2004200c2013201b2022202a2031203820402047204f2056205e2065206c2074207b2083208a2091209920a020a820af20b620be20c520cc20d420db20e320ea20f120f921002107210f2116211d2125212c2133213b2142214921512158215f2166216e2175217c2184218b2192219921a121a821af21b621be21c521cc21d321db21e221e921f021f821ff2206220d2214221c2223222a2231223822402247224e2255225c2263226b2272227922802287228e2295229d22a422ab22b222b922c022c722ce22d622dd22e422eb22f222f923002307230e2315231c2323232b2332233923402347234e2355235c2363236a23712378237f2386238d2394239b23a223a923b023b723be23c523cc23d323da23e123e823ef23f623fd2403240a24112418241f2426242d2434243b2442244924502456245d2464246b2472247924802487248d2494249b24a224a924b024b624bd24c424cb24d224d924df24e624ed24f424fb25012508250f2516251d2523252a25312538253e2545254c2553255925602567256e2574257b25822588258f2596259c25a325aa25b125b725be25c525cb25d225d925df25e625ed25f325fa26002607260e2614261b26222628262f2635263c2643264926502656265d2663266a26712677267e2684268b26912698269e26a526ab26b226b926bf26c626cc26d326d926e026e626ec26f326f927002706270d2713271a27202727272d2733273a27402747274d2754275a27602767276d2774277a27802787278d2793279a27a027a727ad27b327ba27c027c627cd27d327d927e027e627ec27f227f927ff2805280c28122818281e2825282b28312838283e2844284a28502857285d2863286928702876287c28822888288f2895289b28a128a728ad28b428ba28c028c628cc28d228d928df28e528eb28f128f728fd2903290929102916291c29222928292e2934293a29402946294c29522958295e2964296a29702976297c29822988298e2994299a29a029a629ac29b229b829be29c429ca29d029d629dc29e229e829ee29f429fa29ff2a052a0b2a112a172a1d2a232a292a2f2a342a3a2a402a462a4c2a522a582a5d2a632a692a6f2a752a7a2a802a862a8c2a922a972a9d2aa32aa92aaf2ab42aba2ac02ac62acb2ad12ad72adc2ae22ae82aee2af32af92aff2b042b0a2b102b152b1b2b212b262b2c2b322b372b3d2b432b482b4e2b542b592b5f2b642b6a2b702b752b7b2b802b862b8c2b912b972b9c2ba22ba72bad2bb22bb82bbd2bc32bc92bce2bd42bd92bdf2be42bea2bef2bf52bfa2bff2c052c0a2c102c152c1b2c202c262c2b2c302c362c3b2c412c462c4c2c512c562c5c2c612c662c6c2c712c772c7c2c812c872c8c2c912c972c9c2ca12ca72cac2cb12cb62cbc2cc12cc62ccc2cd12cd62cdb2ce12ce62ceb2cf02cf62cfb2d002d052d0a2d102d152d1a2d1f2d242d2a2d2f2d342d392d3e2d442d492d4e2d532d582d5d2d622d672d6d2d722d772d7c2d812d862d8b2d902d952d9a2d9f2da52daa2daf2db42db92dbe2dc32dc82dcd2dd22dd72ddc2de12de62deb2df02df52dfa2dff2e042e092e0e2e132e172e1c2e212e262e2b2e302e352e3a2e3f2e442e492e4d2e522e572e5c2e612e662e6b2e6f2e742e792e7e2e832e882e8c2e912e962e9b2ea02ea42ea92eae2eb32eb72ebc2ec12ec62eca2ecf2ed42ed92edd2ee22ee72eeb2ef02ef52ef92efe2f032f072f0c2f112f152f1a2f1f2f232f282f2d2f312f362f3a2f3f2f442f482f4d2f512f562f5a2f5f2f642f682f6d2f712f762f7a2f7f2f832f882f8c2f912f952f9a2f9e2fa32fa72fac2fb02fb52fb92fbe2fc22fc62fcb2fcf2fd42fd82fdd2fe12fe52fea2fee2ff22ff72ffb300030043008300d30113015301a301e30223027302b302f30333038303c304030453049304d30513056305a305e30623067306b306f30733077307c308030843088308c309030953099309d30a130a530a930ad30b230b630ba30be30c230c630ca30ce30d230d630da30df30e330e730eb30ef30f330f730fb30ff31033107310b310f31133117311b311f31233127312a312e31323136313a313e31423146314a314e315231563159315d316131653169316d317131743178317c318031843187318b318f31933197319a319e31a231a631a931ad31b131b531b831bc31c031c331c731cb31cf31d231d631da31dd31e131e531e831ec31f031f331f731fa31fe320232053209320c321032143217321b321e322232253229322c323032333237323b323e324232453249324c324f32533256325a325d326132643268326b326e327232753279327c327f32833286328a328d329032943297329a329e32a132a432a832ab32ae32b232b532b832bb32bf32c232c532c832cc32cf32d232d532d932dc32df32e232e532e932ec32ef32f232f532f832fc32ff330233053308330b330e331233153318331b331e332133243327332a332d3330333333363339333c333f334233453348334b334e335133543357335a335d3360336333663369336c336f337233753377337a337d3380338333863389338c338e339133943397339a339d339f33a233a533a833aa33ad33b033b333b633b833bb33be33c133c333c633c933cb33ce33d133d333d633d933db33de33e133e333e633e933eb33ee33f133f333f633f833fb33fd3400340334053408340a340d340f3412341434173419341c341e3421342334263428342b342d34303432343534373439343c343e3441344334453448344a344d344f3451345434563458345b345d345f3462346434663469346b346d346f3472347434763478347b347d347f3481348434863488348a348c348e34913493349534973499349b349e34a034a234a434a634a834aa34ac34ae34b034b334b534b734b934bb34bd34bf34c134c334c534c734c934cb34cd34cf34d134d334d534d734d834da34dc34de34e034e234e434e634e834ea34eb34ed34ef34f134f334f534f734f834fa34fc34fe350035013503350535073508350a350c350e350f35113513351535163518351a351b351d351f352035223524352535273529352a352c352d352f353135323534353535373539353a353c353d353f3540354235433545354635483549354b354c354e354f3551355235543555355635583559355b355c355d355f3560356235633564356635673568356a356b356c356e356f35703571357335743575357635783579357a357b357d357e357f35803581358335843585358635873588358a358b358c358d358e358f359035913593359435953596359735983599359a359b359c359d359e359f35a035a135a235a335a435a535a635a735a835a935aa35aa35ab35ac35ad35ae35af35b035b135b235b235b335b435b535b635b735b735b835b935ba35bb35bb35bc35bd35be35be35bf35c035c135c135c235c335c335c435c535c535c635c735c735c835c935c935ca35cb35cb35cc35cc35cd35ce35ce35cf35cf35d035d035d135d135d235d235d335d335d435d435d535d535d635d635d735d735d835d835d835d935d935da35da35da35db35db35dc35dc35dc35dd35dd35dd35de35de35de35de35df35df35df35e035e035e035e035e135e135e135e135e135e235e235e235e235e235e335e335e335e335e335e335e335e335e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e435e335e335e335e335e335e335e335e235e235e235e235e235e235e135e135e135e135e135e035e035e035e035df35df35df35de35de35de35dd35dd35dd35dc35dc35dc35db35db35db35da35da35da35d935d935d835d835d735d735d735d635d635d535d535d435d435d335d335d235d235d135d135d035cf35cf35ce35ce35cd35cd35cc35cb35cb35ca35c935c935c835c735c735c635c535c535c435c335c335c235c135c135c035bf35be35be35bd35bc35bb35ba35ba35b935b835b735b635b535b535b435b335b235b135b035af35ae35ae35ad35ac35ab35aa35a935a835a735a635a535a435a335a235a135a0359f359e359d359c359b359a359935983597359535943593359235913590358f358e358c358b358a35893588358735853584358335823580357f357e357d357b357a35793578357635753574357235713570356e356d356c356a3569356735663565356335623560355f355e355c355b3559355835563555355335523550354f354d354c354a354935473545354435423541353f353e353c353a353935373535353435323530352f352d352b352a35283526352535233521351f351e351c351a35183516351535133511350f350d350c350a3508350635043502350034ff34fd34fb34f934f734f534f334f134ef34ed34eb34e934e734e534e334e134df34dd34db34d934d734d534d334d134cf34cd34cb34c934c634c434c234c034be34bc34ba34b734b534b334b134af34ac34aa34a834a634a434a1349f349d349a3498349634943491348f348d348a3488348634833481347f347c347a3477347534733470346e346b3469346634643461345f345c345a3458345534523450344d344b3448344634433441343e343b3439343634343431342e342c3429342634243421341e341c3419341634143411340e340b340934063403340033fe33fb33f833f533f233f033ed33ea33e733e433e133df33dc33d933d633d333d033cd33ca33c733c433c133be33bb33b833b533b233af33ac33a933a633a333a0339d339a339733943391338e338b338833853381337e337b337833753372336f336b336833653362335f335b335833553352334e334b334833453341333e333b333733343331332d332a332733233320331c331933163312330f330b33083305330132fe32fa32f732f332f032ec32e932e532e232de32db32d732d432d032cc32c932c532c232be32ba32b732b332b032ac32a832a532a1329d329932963292328e328b32873283327f327c327832743270326d326932653261325d325932563252324e324a32463242323e323a32373233322f322b32273223321f321b32173213320f320b3207320331ff31fb31f731f331ef31eb31e731e231de31da31d631d231ce31ca31c631c131bd31b931b531b131ad31a831a431a0319c31973193318f318b31863182317e317931753171316d31683164315f315b31573152314e314a31453141313c31383133312f312b31263122311d311931143110310b3107310230fe30f930f430f030eb30e730e230de30d930d430d030cb30c630c230bd30b830b430af30aa30a630a1309c30973093308e308930843080307b30763071306d30683063305e30593054304f304b30463041303c30373032302d30283023301e301930153010300b300630012ffc2ff72ff22fec2fe72fe22fdd2fd82fd32fce2fc92fc42fbf2fba2fb52faf2faa2fa52fa02f9b2f962f902f8b2f862f812f7c2f762f712f6c2f672f612f5c2f572f512f4c2f472f422f3c2f372f322f2c2f272f212f1c2f172f112f0c2f062f012efc2ef62ef12eeb2ee62ee02edb2ed52ed02eca2ec52ebf2eba2eb42eaf2ea92ea32e9e2e982e932e8d2e872e822e7c2e772e712e6b2e662e602e5a2e552e4f2e492e432e3e2e382e322e2c2e272e212e1b2e152e0f2e0a2e042dfe2df82df22dec2de72de12ddb2dd52dcf2dc92dc32dbd2db72db12dab2da62da02d9a2d942d8e2d882d822d7c2d762d6f2d692d632d5d2d572d512d4b2d452d3f2d392d332d2c2d262d202d1a2d142d0e2d072d012cfb2cf52cef2ce82ce22cdc2cd62ccf2cc92cc32cbc2cb62cb02caa2ca32c9d2c962c902c8a2c832c7d2c772c702c6a2c632c5d2c562c502c4a2c432c3d2c362c302c292c232c1c2c162c0f2c082c022bfb2bf52bee2be82be12bda2bd42bcd2bc72bc02bb92bb32bac2ba52b9f2b982b912b8a2b842b7d2b762b6f2b692b622b5b2b542b4e2b472b402b392b322b2b2b252b1e2b172b102b092b022afb2af42aed2ae72ae02ad92ad22acb2ac42abd2ab62aaf2aa82aa12a9a2a932a8c2a852a7d2a762a6f2a682a612a5a2a532a4c2a452a3d2a362a2f2a282a212a1a2a122a0b2a0429fd29f529ee29e729e029d829d129ca29c329bb29b429ad29a5299e2997298f2988298029792972296a2963295b2954294c2945293e2936292f29272920291829112909290128fa28f228eb28e328dc28d428cc28c528bd28b628ae28a6289f2897288f28882880287828712869286128592852284a2842283a2833282b2823281b2813280b280427fc27f427ec27e427dc27d427cd27c527bd27b527ad27a5279d2795278d2785277d2775276d2765275d2755274d2745273d2735272d2724271c2714270c270426fc26f426ec26e326db26d326cb26c326ba26b226aa26a2269a26912689268126782670266826602657264f2647263e2636262d2625261d2614260c260325fb25f325ea25e225d925d125c825c025b725af25a6259e2595258d2584257c2573256a2562255925512548253f2537252e2525251d2514250b250324fa24f124e924e024d724ce24c624bd24b424ab24a3249a24912488247f2476246e2465245c2453244a24412438242f2426241e2415240c240323fa23f123e823df23d623cd23c423bb23b223a923a02396238d2384237b2372236923602357234e2344233b2332232923202317230d230422fb22f222e822df22d622cd22c322ba22b122a7229e2295228b22822279226f2266225d2253224a22402237222e2224221b2211220821fe21f521eb21e221d821cf21c521bc21b221a9219f2195218c21822179216f2165215c21522148213f2135212b21222118210e210520fb20f120e720de20d420ca20c020b620ad20a32099208f2085207b20722068205e2054204a20402036202c20222018200e20051ffb1ff11fe71fdd1fd31fc91fbf1fb41faa1fa01f961f8c1f821f781f6e1f641f5a1f501f451f3b1f311f271f1d1f131f081efe1ef41eea1ee01ed51ecb1ec11eb61eac1ea21e981e8d1e831e791e6e1e641e5a1e4f1e451e3a1e301e261e1b1e111e061dfc1df21de71ddd1dd21dc81dbd1db31da81d9e1d931d881d7e1d731d691d5e1d541d491d3e1d341d291d1f1d141d091cff1cf41ce91cde1cd41cc91cbe1cb41ca91c9e1c931c891c7e1c731c681c5d1c531c481c3d1c321c271c1c1c111c071bfc1bf11be61bdb1bd01bc51bba1baf1ba41b991b8e1b831b781b6d1b621b571b4c1b411b361b2b1b201b151b0a1aff1af31ae81add1ad21ac71abc1ab01aa51a9a1a8f1a841a781a6d1a621a571a4b1a401a351a2a1a1e1a131a0819fc19f119e619da19cf19c419b819ad19a11996198b197f19741968195d19511946193a192f19231918190c190118f518ea18de18d218c718bb18b018a41898188d18811876186a185e18531847183b182f18241818180c180117f517e917dd17d117c617ba17ae17a21796178b177f17731767175b174f17431737172b17201714170816fc16f016e416d816cc16c016b416a8169c169016841678166c165f16531647163b162f16231617160b15fe15f215e615da15ce15c215b515a9159d159115841578156c156015531547153b152e15221516150914fd14f114e414d814cb14bf14b314a6149a148d148114741468145c144f144314361429141d1410140413f713eb13de13d213c513b813ac139f139313861379136d136013531347133a132d13201314130712fa12ed12e112d412c712ba12ae12a112941287127a126d126112541247123a122d12201213120611f911ec11df11d211c511b811ab119e119111841177116a115d1150114311361129111c110f110210f510e710da10cd10c010b310a61098108b107e1071106310561049103c102e1021101410070ff90fec0fdf0fd10fc40fb70fa90f9c0f8e0f810f740f660f590f4b0f3e0f300f230f150f080efa0eed0edf0ed20ec40eb70ea90e9c0e8e0e810e730e650e580e4a0e3d0e2f0e210e140e060df80deb0ddd0dcf0dc10db40da60d980d8b0d7d0d6f0d610d530d460d380d2a0d1c0d0e0d000cf30ce50cd70cc90cbb0cad0c9f0c910c830c750c680c5a0c4c0c3e0c300c220c140c060bf80bea0bdb0bcd0bbf0bb10ba30b950b870b790b6b0b5d0b4e0b400b320b240b160b080af90aeb0add0acf0ac00ab20aa40a960a870a790a6b0a5c0a4e0a400a310a230a150a0609f809ea09db09cd09be09b009a209930985097609680959094b093c092e091f0911090208f408e508d608c808b908ab089c088d087f0870086208530844083608270818080907fb07ec07dd07cf07c007b107a2079407850776076707580749073b072c071d070e06ff06f006e106d206c406b506a6069706880679066a065b064c063d062e061f0610060105f205e305d405c505b505a6059705880579056a055b054c053c052d051e050f050004f004e104d204c304b304a40495048604760467045804480439042a041a040b03fc03ec03dd03cd03be03af039f039003800371036103520342033303230314030402f502e502d602c602b702a7029702880278026902590249023a022a021a020b01fb01eb01dc01cc01bc01ac019d018d017d016d015e014e013e012e011e010f00ff00ef00df00cf00bf00af00a00090008000700060005000400030002000100000`,u=Math.floor,d=new Int32Array(4097);for(let e=0;e<=4096;e++)d[e]=(e<<4)+parseInt(l.substr(e*4,4),16);var f={a:0,b:0};function p(){f.a=((f.a>>>16|f.a<<16)>>>0)+f.b>>>0,f.b=f.b+f.a>>>0}function m(e=0){f.b=(Math.round(e*65536)&2147483647)>>>0||3735928559,f.a=(f.b^3199019450)>>>0;for(let e=0;e<32;e++)p()}m(Math.floor(Math.random()*2147418112)/65536);function h(e,t=`,`,n=!0){return e.split(t).map(e=>n&&e!==``&&e.trim()===e&&!isNaN(Number(e))?Number(e):e)}var ee=[0,1911635,8267091,34641,11227702,6248271,12764103,16773608,16711757,16753408,16772135,58422,2731519,8615580,16742312,16764074,2693140,1121589,4333878,1200985,7614249,4797243,10651769,15986557,12456528,16739364,11069230,46403,416437,7685733,16739929,16752001],g=new Uint8Array(16384),_=new Uint8Array(16384),v=new Uint8Array(4096),y=new Uint8Array(256),b=new Uint8Array(2048),x=0,S=0,C={cameraX:0,cameraY:0,clipX1:0,clipY1:0,clipX2:128,clipY2:128,pen:6,drawPalette:new Uint8Array(16),screenPalette:new Uint8Array(16),fillPattern:0,fillTransparent:!1};function w(e){_=e.gfx,y=e.flags,v=e.map.slice()}function te(){C.cameraX=C.cameraY=0,C.pen=6,A(),j(),b.fill(0),x=0,S=0,g.fill(0)}function T(e,t,n,r,i,a){if(!(e<C.clipX1||e>=C.clipX2||t<C.clipY1||t>=C.clipY2)){if(i&&i>>15-(e&3)-4*(t&3)&1){if(a)return;n=r}g[t*128+e]=n}}function E(e){return e!==void 0&&(C.pen=u(e)&255),{color:C.drawPalette[C.pen&15]&15,color2:C.drawPalette[C.pen>>4&15]&15,pattern:C.fillPattern,transparent:C.fillTransparent}}function D(e,t,n,r){if(!(n<C.clipY1||n>=C.clipY2)){e>t&&([e,t]=[t,e]),e=Math.max(e,C.clipX1),t=Math.min(t,C.clipX2-1);for(let i=e;i<=t;i++)T(i,n,r.color,r.color2,r.pattern,r.transparent)}}function O(e,t,n,r){if(!(e<C.clipX1||e>=C.clipX2)){t>n&&([t,n]=[n,t]),t=Math.max(t,C.clipY1),n=Math.min(n,C.clipY2-1);for(let i=t;i<=n;i++)T(e,i,r.color,r.color2,r.pattern,r.transparent)}}function k(e=0,t=0){C.cameraX=u(e),C.cameraY=u(t)}function A(e,t,n,r){if(r===void 0){C.clipX1=C.clipY1=0,C.clipX2=C.clipY2=128;return}[e,t,n,r]=[u(e),u(t),u(n),u(r)],C.clipX1=Math.min(Math.max(0,e),128),C.clipY1=Math.min(Math.max(0,t),128),C.clipX2=Math.max(0,Math.min(128,e+Math.max(n,0))),C.clipY2=Math.max(0,Math.min(128,t+Math.max(r,0)))}function j(e,t,n=0){if(e===void 0||t===void 0){for(let e=0;e<16;e++)C.drawPalette[e]=e|(e?0:16),C.screenPalette[e]=e;C.fillPattern=0,C.fillTransparent=!1;return}let r=u(e)&15;n===1?C.screenPalette[r]=u(t)&255:C.drawPalette[r]=C.drawPalette[r]&16|u(t)&15}function M(e=0){g.fill(u(e)&15),A()}function N(e,t,n,r,i){if(e=u(e)-C.cameraX,t=u(t)-C.cameraY,n=u(n)-C.cameraX,r=u(r)-C.cameraY,e>n&&([e,n]=[n,e]),t>r&&([t,r]=[r,t]),n<0||e>=128||r<0||t>=128)return;let a=E(i);D(e,n,t,a),D(e,n,r,a),t+1<r&&(O(e,t+1,r-1,a),O(n,t+1,r-1,a))}function P(e,t,n,r,i){if(e=u(e)-C.cameraX,t=u(t)-C.cameraY,n=u(n)-C.cameraX,r=u(r)-C.cameraY,t>r&&([t,r]=[r,t]),e>n?e<0||n>=128:n<0||e>=128)return;t=Math.max(t,-1),r=Math.min(r,128);let a=E(i);for(let i=t;i<=r;i++)D(e,n,i,a)}function F(e,t,n,r=1,i=1,a=!1,o=!1){e=u(e),t=u(t)-C.cameraX,n=u(n)-C.cameraY;let s=u(r*8),c=u(i*8);if(t+s<=0||t>=128||n+c<=0||n>=128)return;let l=e%16*8,d=u(e/16)*8;for(let e=0;e<c;e++)for(let r=0;r<s;r++){let i=a?s-1-r:r,u=o?c-1-e:e,f=l+i,p=d+u,m=f>=0&&f<128&&p>=0&&p<128?_[p*128+f]:0,h=C.drawPalette[m];h&16||T(t+r,n+e,h&15,0,0,!1)}}function I(e=0,t=0,n=0,r=0,i=128,a=32,o=0){n=u(n)-C.cameraX,r=u(r)-C.cameraY;let s=u(i)*8,c=u(a)*8,l=u(e)*8,d=u(t)*8,f=Math.max(-n,0),p=Math.max(-r,0);if(l+=f,d+=p,s-=f+Math.max(s+n-128,0),c-=p+Math.max(c+r-128,0),n+=f,r+=p,!(s<=0||c<=0))for(let e=0;e<c;e++)for(let t=0;t<s;t++){let i=l+t,a=d+e;if(i<0||i>=1024||a<0||a>=256)continue;let s=v[(a>>3)*128+(i>>3)];if(s===0||o&&!(y[s]&o))continue;let c=_[((s>>4)*8+(a&7))*128+(s&15)*8+(i&7)],u=C.drawPalette[c];u&16||T(n+t,r+e,u&15,0,0,!1)}}function L(e,t,n,r){let i=E(r);if(e=String(e),(x&129)!=129)return;let a=b[0],o=b[1],s=Math.min(b[2],8),c=u(t)-C.cameraX+b[3],l=u(n)-C.cameraY+b[4];for(let t=0;t<e.length;t++){let n=e.charCodeAt(t)&255,r=n<128?a:o;for(let e=0;e<s;e++){let t=b[n*8+e];for(let n=0;n<r;n++)t>>n&1&&T(c+n,l+e,i.color,0,0,!1)}c+=r}}function R(e,...t){t.forEach((t,n)=>{let r=e+n;r>=22016&&r<24064?b[r-22016]=t:r===24408?x=t:r===24364&&(S=t)})}function z(){return S===3?64:128}function ne(e,t=C.screenPalette){let n=z(),r=0;for(let i=0;i<n;i++)for(let a=0;a<n;a++){let n=t[g[i*128+a]],o=ee[n&15|(n&128?16:0)];e[r++]=o>>16,e[r++]=o>>8&255,e[r++]=o&255,e[r++]=255}}[,,,,,,].fill(0);var re=`6,8,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,63,63,63,63,63,63,0,0,0,63,63,63,0,0,0,0,0,63,51,63,0,0,0,0,0,51,12,51,0,0,0,0,0,51,0,51,0,0,0,0,0,51,51,51,0,0,0,0,48,60,63,60,48,0,0,0,3,15,63,15,3,0,0,62,6,6,6,6,0,0,0,0,0,48,48,48,48,62,0,99,54,28,62,8,62,8,0,0,0,0,24,0,0,0,0,0,0,0,0,0,12,24,0,0,0,0,0,0,12,12,0,0,0,10,10,0,0,0,0,0,4,10,4,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,5,5,0,0,0,0,0,0,0,0,1,0,0,0,0,0,14,17,21,17,14,0,0,0,1,4,2,1,4,0,0,0,0,5,7,2,0,0,0,0,1,1,0,0,0,0,0,0,2,1,1,1,2,0,0,0,1,2,2,2,1,0,0,0,0,5,2,5,0,0,0,0,0,2,7,2,0,0,0,0,0,0,0,0,1,1,0,0,0,0,7,0,0,0,0,0,0,0,0,0,1,0,0,0,4,4,2,2,1,1,0,0,2,5,5,5,2,0,0,0,2,3,2,2,2,0,0,0,3,4,2,1,7,0,0,0,3,4,2,4,3,0,0,0,5,5,7,4,4,0,0,0,7,1,3,4,3,0,0,0,2,1,3,5,2,0,0,0,7,4,4,2,2,0,0,0,2,5,2,5,2,0,0,0,2,5,6,4,2,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,1,0,0,4,2,1,2,4,0,0,0,0,7,0,7,0,0,0,0,1,2,4,2,1,0,0,0,3,4,2,0,2,0,0,0,2,5,5,1,6,0,0,0,0,6,5,5,6,0,0,0,1,3,5,5,3,0,0,0,0,6,1,1,6,0,0,0,4,6,5,5,6,0,0,0,0,2,7,1,2,0,0,0,2,1,1,3,1,1,0,0,0,6,5,7,4,3,0,0,1,3,5,5,5,0,0,0,1,0,1,1,1,0,0,0,2,0,2,2,2,1,0,0,1,5,3,5,5,0,0,0,1,1,1,1,1,0,0,0,0,15,21,21,21,0,0,0,0,3,5,5,5,0,0,0,0,2,5,5,2,0,0,0,0,3,5,5,3,1,0,0,0,6,5,5,6,4,0,0,0,5,3,1,1,0,0,0,0,3,1,2,3,0,0,0,1,3,1,1,2,0,0,0,0,5,5,5,6,0,0,0,0,5,5,5,2,0,0,0,0,17,21,21,10,0,0,0,0,5,2,2,5,0,0,0,0,5,5,6,4,3,0,0,0,15,4,2,15,0,0,0,3,1,1,1,3,0,0,0,1,1,2,2,4,4,0,0,3,2,2,2,3,0,0,0,2,5,0,0,0,0,0,0,0,0,0,0,7,0,0,0,1,2,0,0,0,0,0,0,2,5,5,7,5,0,0,0,3,5,3,5,3,0,0,0,6,1,1,1,6,0,0,0,3,5,5,5,3,0,0,0,7,1,3,1,7,0,0,0,7,1,1,3,1,0,0,0,6,1,1,5,6,0,0,0,5,5,7,5,5,0,0,0,1,1,1,1,1,0,0,0,2,2,2,2,2,1,0,0,5,5,3,5,5,0,0,0,1,1,1,1,7,0,0,0,17,27,21,17,17,0,0,0,3,5,5,5,5,0,0,0,2,5,5,5,2,0,0,0,3,5,5,3,1,0,0,0,2,5,5,5,2,4,0,0,3,5,5,3,5,0,0,0,6,1,2,4,3,0,0,0,7,2,2,2,2,0,0,0,5,5,5,5,6,0,0,0,5,5,5,5,2,0,0,0,17,17,21,27,17,0,0,0,5,5,2,5,5,0,0,0,5,5,5,6,4,2,0,0,7,4,2,1,7,0,0,0,2,2,2,7,2,0,0,0,1,1,1,1,1,1,0,0,0,7,7,7,2,0,0,0,5,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,127,127,127,127,127,127,127,0,85,42,85,42,85,42,85,0,65,99,127,93,93,119,62,0,62,99,99,119,62,65,62,0,17,68,17,68,17,68,17,0,4,12,124,62,31,24,16,0,28,38,95,95,127,62,28,0,34,119,127,127,62,28,8,0,42,28,54,119,54,28,42,0,62,15,15,6,0,0,0,0,8,28,62,127,62,42,58,0,62,103,99,103,62,65,62,0,62,127,93,93,127,99,62,0,24,120,8,8,8,15,7,0,62,99,107,99,62,65,62,0,8,20,42,93,42,20,8,0,0,0,0,85,0,0,0,0,62,115,99,115,62,65,62,0,8,28,127,28,54,34,0,0,127,34,20,8,20,34,127,0,62,119,99,99,62,65,62,0,0,10,4,0,80,32,0,0,17,42,68,0,17,42,68,0,62,107,119,107,62,65,62,0,127,0,127,0,127,0,127,0,85,85,85,85,85,85,85,0`,ie=`(=1,)=1,Z=-1,j=1,J=1,.=2,w=-2,W=-2,m=-2,M=-2,S=1,W=-2,'=2,T=1,I=2, =2,i=2,L=2,F=1,=-4,=-4,=-4,=-4,=-4,=-4,:=2`,B=[{text:`pICO-8`,href:`pico8/`,y:34},{text:`pHASER 4`,href:`phaser4/`,y:44}],V=document.getElementById(`screen`),H=V.getContext(`2d`),U=H.createImageData(64,64);w(c(e)),te(),R(24364,3),R(22016,...h(re)),R(24408,129);var W={};for(let e of h(ie)){let[t,n]=h(e,`=`);W[t]=n}function G(e){let t=0;for(let n of e)t+=4-(W[n]||0);return t}function K(e,t,n,r,i){for(let a of e)i!==void 0&&L(a,t,n+1,i),L(a,t,n,r),t+=4-(W[a]||0)}var q=0,J=0;function Y(){M(),j(),k(320,64),I(),k(),F(187,12,6,5,1),P(6,29,57,54,0),N(6,29,57,54,1),B.forEach((e,t)=>{let n=32-G(e.text)/2,r=t===q;K(e.text,n,e.y,r?7:13,r?5:void 0),r&&Math.floor(J/8)%2==0&&(K(`>`,n-6,e.y,7),K(`<`,n+G(e.text)+1,e.y,7))}),j(14,131,1),j(15,139,1),ne(U.data),H.putImageData(U,0,0)}function X(){location.href=B[q].href}window.addEventListener(`keydown`,e=>{if(e.code===`ArrowUp`||e.code===`ArrowLeft`)q=(q+B.length-1)%B.length;else if(e.code===`ArrowDown`||e.code===`ArrowRight`)q=(q+1)%B.length;else if([`Enter`,`Space`,`KeyZ`,`KeyX`,`KeyC`,`KeyV`,`KeyN`,`KeyM`].includes(e.code))X();else return;e.preventDefault(),Y()});function Z(e){let t=V.getBoundingClientRect(),n=(e.clientY-t.top)/t.height*64;return B.findIndex(e=>n>=e.y-3&&n<e.y+8)}V.addEventListener(`pointermove`,e=>{let t=Z(e);t>=0&&(q=t)}),V.addEventListener(`click`,e=>{let t=Z(e);t>=0&&(q=t,X())});var Q=0;function $(e){e-Q>=1e3/30&&(Q=e,J++,Y()),requestAnimationFrame($)}Y(),requestAnimationFrame($);