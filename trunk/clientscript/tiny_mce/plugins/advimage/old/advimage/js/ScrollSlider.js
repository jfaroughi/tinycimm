// ScrollSlider - GPL v3
// (C) 2007  Kevin Weibell
var ScrollSlider=function(e,f,g){if(typeof(e)==='string'){e=document.getElementById(e)}var h=e.style;h.height=17-(window.opera?1:0)+'px';h.overflow='scroll';h.overflowY='hidden';var j=document.createElement('div');j.style.height='1px';e.appendChild(j);f=f||{};e.min=0;e.max=100;e.value=0;e.size=f.size||150;e.scroll=f.scroll||function(){};e.getValue=function(){return this.value=this.scrollLeft+this.min};e.setValue=function(a){this.value=a;var b=this;setTimeout(function(){b.scrollLeft=a-b.min},10)};e.change=function(a,b){var c=this.range;for(var i in a){this[i]=(typeof(a[i])==='function')?a[i]:parseInt(a[i])}this.range=this.max-this.min;this.style.width=this.size+(window.opera?16:0)+'px';this.firstChild.style.width=this.range+this.size+'px';this.setValue(this.value);if(!b&&(c!==this.range)){var d=this;d.focus();setTimeout(function(){d.blur()},0)}};e.change(f,true);e.onscroll=function(){this.scroll(this.getValue())};if(!g){e.scroll(e.getValue())}return e};