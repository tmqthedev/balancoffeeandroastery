const r=(r,t=!0)=>{if(!r&&0!==r)return t?"0₫":"0";const n=new Intl.NumberFormat("vi-VN").format(r);return t?`${n}₫`:n};export{r as f};
