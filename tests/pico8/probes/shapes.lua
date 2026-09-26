-- draws shapes and prints their pixels (see probes.spec.js)
function bits(x0,y0,x1,y1)
 local s=""
 for y=y0,y1 do
  s..=" "
  for x=x0,x1 do s..=pget(x,y)==7 and "1" or "0" end
 end
 return s
end
for w=0,20 do
 for h=0,20 do
  cls() ovalfill(10,10,10+w,10+h,7)
  printh("ovalfill "..w.." "..h..bits(9,9,11+w,11+h))
 end
end
for r=0,12 do
 cls() circfill(20,20,r,7)
 printh("circfill "..r..bits(19-r,19-r,21+r,21+r))
end
for dx=-10,10 do
 for dy=-10,10 do
  cls() line(20,20,20+dx,20+dy,7)
  printh("line "..dx.." "..dy..bits(9,9,31,31))
 end
end
cls()
fillp(0b1010010110100101.1) rectfill(0,0,7,7,5)
fillp(0b0111111111011111.1) rectfill(8,0,15,7,13)
fillp(0b0101101001011010) rectfill(16,0,23,7,0x3b)
fillp()
local s="fillp"
for y=0,7 do
 s..=" "
 for x=0,23 do s..=sub(tostr(pget(x,y),true),6,6) end
end
printh(s)
printh("done")
