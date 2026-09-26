-- plays the sound effects of the game, then the music (see sound.spec.js)
list=split"51,52,53,54,55,56,57,58,59,60,61,62,63"
f=0
function _update()
 f+=1
 local i=f\75
 if f%75==1 and list[i+1] then
  sfx(list[i+1])
  printh("mark "..list[i+1])
 end
 if f==#list*75+10 then
  music(0)
  printh("mark music")
 end
 if f==#list*75+10+30*20 then
  music(-1)
  printh("done")
 end
end
