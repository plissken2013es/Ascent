-- prints the bits of numbers computed by PICO-8 (see probes.spec.js)
function hex(n) return sub(tostr(n,true),3) end
-- sin() and cos() over the whole circle
for i=0,4095 do
 local x=i/4096-0.5
 printh("sin "..i.." "..hex(sin(x)).." "..hex(cos(x)))
end
-- literals, division, integer division, multiplication and modulo
printh("fx "..hex(0.35).." "..hex(2.2).." "..hex(0.075).." "..hex(-0.02).." "..hex(0.01))
printh("fdiv "..hex(-7/3).." "..hex(7/3).." "..hex(0x0.0005/8).." "..hex(-0x0.0005/8).." "..hex(1/30))
printh("idiv "..hex(-7\3).." "..hex(7\3).." "..hex(-0x0.0005\8))
printh("fmul "..hex(-0x0.0003*0x0.8).." "..hex(0x0.0003*0x0.8).." "..hex(0x0.1234*0x1.5678))
printh("mod "..hex(-7%3).." "..hex(-0x0.8%3).." "..hex(7.25%2))
-- the random generator
srand(12)
local s="rnd"
for i=1,50 do s..=" "..hex(rnd()) end
for i=1,50 do s..=" "..hex(rnd(48)) end
for i=1,50 do s..=" "..hex(rnd(0.3)) end
for i=1,50 do s..=" "..rnd({1,2,3,4,5,6,7}) end
printh(s)
printh("done")
