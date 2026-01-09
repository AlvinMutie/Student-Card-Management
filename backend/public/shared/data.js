// DEPRECATED: This file is no longer used. 
// Data seeding is now handled by app.js using localStorage key 'sv_data_v2'
// This file is kept for reference only and can be removed.
// 
// Migration note: If you have existing data in 'sv_data', app.js will handle it
// through its seedIfEmpty() function which uses the newer data structure.

// Old data.js - No longer executed (commented out to prevent conflicts)
/*
(function seedData(){
  if(localStorage.getItem('sv_data')) return;
  const initial = {
    parents: [
      {id:'p1', name:'Grace Ndungu', email:'grace@example.com', students:['S001','S005']},
      {id:'p2', name:'John Mwangi', email:'john@example.com', students:['S002']}
    ],
    staff: [
      {id:'t1', name:'Alice W', reg:'T-901', role:'Math Teacher', approved:true},
      {id:'t2', name:'Robert K', reg:'T-902', role:'Science Teacher', approved:false}
    ],
    students: [
      {adm:'S001', name:'David Kimani', cls:'Class 4', qr:'S001'},
      {adm:'S002', name:'Rachel Auma', cls:'Class 6', qr:'S002'},
      {adm:'S005', name:'Stephen O', cls:'Class 1', qr:'S005'}
    ],
    recent: ['System seeded with sample data']
  };
  localStorage.setItem('sv_data', JSON.stringify(initial));
})();
*/
