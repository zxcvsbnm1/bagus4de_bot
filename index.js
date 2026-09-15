function hideAll(){
  document.getElementById('page-home').style.display='none'
  document.getElementById('page-sdy').style.display='none'
  document.getElementById('page-sgp').style.display='none'
  document.getElementById('page-hk').style.display='none'
}

async function loadPasaran(pasaran){
  const tbody = document.getElementById(`tabel-${pasaran}`)
  tbody.innerHTML = '<tr><td colspan=7>Loading...</td></tr>'
  
  const res = await fetch(`/api/index?pasaran=${pasaran}`)
  const json = await res.json()
  
  if(json.error){ tbody.innerHTML = `<tr><td>${json.error}</td></tr>`; return }

  let html = ''
  json.jadwal.forEach(r=>{
    if(pasaran === 'sgp'){
      html+=`<tr><td>${r.senin||'-'}</td><td>${r.rabu||'-'}</td><td>${r.kamis||'-'}</td><td>${r.sabtu||'-'}</td><td>${r.minggu||'-'}</td></tr>`
    } else {
      html+=`<tr><td>${r.senin||'-'}</td><td>${r.selasa||'-'}</td><td>${r.rabu||'-'}</td><td>${r.kamis||'-'}</td><td>${r.jumat||'-'}</td><td>${r.sabtu||'-'}</td><td>${r.minggu||'-'}</td></tr>`
    }
  })
  tbody.innerHTML = html
}

document.getElementById('btn-sdy').onclick = ()=>{ hideAll(); document.getElementById('page-sdy').style.display='block'; loadPasaran('sdy') }
document.getElementById('btn-sgp').onclick = ()=>{ hideAll(); document.getElementById('page-sgp').style.display='block'; loadPasaran('sgp') }
document.getElementById('btn-hk').onclick = ()=>{ hideAll(); document.getElementById('page-hk').style.display='block'; loadPasaran('hk') }
document.getElementById('btn-home').onclick = ()=>{ hideAll(); document.getElementById('page-home').style.display='block' }
