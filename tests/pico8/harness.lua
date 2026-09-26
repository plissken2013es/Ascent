-->8
-- test harness (see tests/pico8/harness.js)
-- fixed seed, scripted buttons and a trace of each frame: frame number,
-- player position and a hash of the visible screen and screen palette
srand($SEED)
_h_s=split"$SCRIPT"
_h_i,_h_n,_h_b,_h_f=1,0,0,0
_h_held={[0]=0,0,0,0,0,0}
function btn(b) return _h_held[b]>0 end
function btnp(b)
 local f=_h_held[b]
 return f==1 or (f>15 and (f-16)%4==0)
end
_h_sfx,_h_music=sfx,music
function sfx(n,...) printh("sfx ".._h_f.." "..n) _h_sfx(n,...) end
function music(n,...) printh("music ".._h_f.." "..n) _h_music(n,...) end
_h_u,_h_d=_update,_draw
_draw=nil
function _update()
 if _h_n<=0 then
  _h_n,_h_b=_h_s[_h_i] or 32767,_h_s[_h_i+1] or 0
  _h_i+=2
 end
 _h_n-=1
 _h_f+=1
 for i=0,5 do
  _h_held[i]=(_h_b&(1<<i))>0 and _h_held[i]+1 or 0
 end
 if _h_f==1 then
  $SETUP
 end
 if _h_f<=$LAST then
  _h_u() _h_d()
  local h=0
  for y=0,63 do
   for x=0,28,4 do
    h=rotl(h^^peek4(0x6000+y*64+x),3)
   end
  end
  for a=0x5f10,0x5f1c,4 do
   h=rotl(h^^peek4(a),3)
  end
  if _h_f==$DUMP then
   for y=0,63 do
    local s=""
    for x=0,31 do
     s..=sub(tostr(peek(0x6000+y*64+x),true),5,6)
    end
    printh("row "..y.." "..s)
   end
  end
  printh("frame ".._h_f.." "..tostr(pl.x,true).." "..tostr(pl.y,true).." "..tostr(h,true).." "..tostr(t(),true))
 end
end
