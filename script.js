const ponto={nome:"A Menina sem Nome",latitude:-8.0638,longitude:-34.8895,raio:30};
const narrativa=`Você chegou a um lugar onde a cidade guarda histórias que nem sempre aparecem nos livros.
Observe este ponto.
Aqui está a Menina sem Nome.
Neste protótipo, ela não representa uma biografia inventada. Ela representa uma pergunta: o que acontece com uma história quando o nome desaparece?
Nos cemitérios, alguns nomes permanecem muito visíveis. São artistas, políticos, escritores e outras pessoas reconhecidas pela história.
Mas existem também milhares de vidas comuns. Pessoas que trabalharam, amaram, fizeram planos, cuidaram de suas famílias e deixaram marcas em outras pessoas.
A Menina sem Nome representa, simbolicamente, essas histórias silenciosas.
Ela nos convida a olhar para o cemitério de outra maneira.
Não apenas para os grandes monumentos, mas também para as pequenas inscrições, as fotografias, as flores, as datas e os gestos de quem ainda visita.
Porque patrimônio não é somente aquilo que é grandioso.
Patrimônio também pode estar na memória.
E talvez a pergunta mais importante desta parada seja:
Se o nome desaparece, a história também desaparece?
Continue seu percurso.
Há muitas outras histórias esperando para serem descobertas.`;

const map=L.map("map").setView([ponto.latitude,ponto.longitude],18);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:21,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
L.marker([ponto.latitude,ponto.longitude]).addTo(map).bindPopup("<strong>🎧 A Menina sem Nome</strong><br>Quarteirão 11 · Túmulo F66").openPopup();
L.circle([ponto.latitude,ponto.longitude],{radius:ponto.raio,color:"#647b58",fillColor:"#647b58",fillOpacity:.12,weight:2}).addTo(map);

let visitante=null;
const gpsStatus=document.getElementById("gpsStatus");
const distanceText=document.getElementById("distanceText");
const arrivalBadge=document.getElementById("arrivalBadge");
const audioButton=document.getElementById("audioButton");
const audioPlayer=document.getElementById("audioPlayer");

function distancia(lat1,lon1,lat2,lon2){
  const R=6371000,rad=n=>n*Math.PI/180;
  const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function atualizarGPS(pos){
  const {latitude,longitude,accuracy}=pos.coords;
  gpsStatus.textContent=`● GPS ativo • ±${Math.round(accuracy)} m`;
  if(!visitante){
    visitante=L.circleMarker([latitude,longitude],{radius:9,color:"#123a63",fillColor:"#f4c430",fillOpacity:1,weight:3}).addTo(map).bindPopup("📍 Você está aqui");
  }else visitante.setLatLng([latitude,longitude]);
  const d=distancia(latitude,longitude,ponto.latitude,ponto.longitude);
  if(d<=ponto.raio){
    distanceText.innerHTML="<strong>Você está dentro do raio de experiência.</strong> A Menina sem Nome está próxima.";
    arrivalBadge.classList.remove("hidden");
  }else{
    distanceText.textContent=`Você está a aproximadamente ${Math.round(d)} metros deste ponto. O raio de ativação do protótipo é de ${ponto.raio} metros.`;
    arrivalBadge.classList.add("hidden");
  }
}
function erroGPS(){
  gpsStatus.textContent="● GPS indisponível";
  distanceText.textContent="Não foi possível acessar sua localização. Verifique a permissão do navegador.";
}

function falarNarrativa(){
  if(!("speechSynthesis" in window)){
    alert("Este navegador não oferece narração por voz. Tente abrir o protótipo no Chrome ou Safari.");
    return;
  }
  window.speechSynthesis.cancel();
  const fala=new SpeechSynthesisUtterance(narrativa);
  fala.lang="pt-BR";
  fala.rate=0.92;
  fala.pitch=1;
  const vozes=window.speechSynthesis.getVoices();
  const voz=vozes.find(v=>v.lang && v.lang.toLowerCase().startsWith("pt-br")) || vozes.find(v=>v.lang && v.lang.toLowerCase().startsWith("pt"));
  if(voz) fala.voice=voz;
  audioButton.textContent="⏸ Parar narrativa";
  fala.onend=()=>audioButton.textContent="▶ Ouvir a narrativa";
  window.speechSynthesis.speak(fala);
}

audioButton.addEventListener("click",()=>{
  if("speechSynthesis" in window && window.speechSynthesis.speaking){
    window.speechSynthesis.cancel();
    audioButton.textContent="▶ Ouvir a narrativa";
  }else{
    falarNarrativa();
  }
});

if("geolocation" in navigator){
  navigator.geolocation.watchPosition(atualizarGPS,erroGPS,{enableHighAccuracy:true,maximumAge:5000,timeout:10000});
}else erroGPS();
