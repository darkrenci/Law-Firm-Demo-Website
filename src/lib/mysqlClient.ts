export const isMysqlBackend = (import.meta as any).env?.VITE_BACKEND === 'mysql';
const listeners = new Set<() => void>();
let authenticated = false;
let prerenderRows:Record<string,any[]>|undefined;
export function setPrerenderRows(rows:Record<string,any[]>) {
  if(typeof window!=='undefined')throw new Error('Build snapshots are server-only.');
  prerenderRows=rows;
}

export async function backendRequest(path:string, body?:unknown) {
  const response=await fetch(path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const result=await response.json();
  if(!response.ok)throw Object.assign(new Error(result.error||'Website connection failed.'),{status:response.status});
  return result;
}
export const mysqlAuth = {
  async getUser(){
    try{const {user}=await backendRequest('/api/auth/me');authenticated=true;return {data:{user},error:null};}
    catch(error){authenticated=false;return {data:{user:null},error};}
  },
  async signInWithPassword(credentials:{email:string;password:string}){
    try{const result=await backendRequest('/api/auth/login',credentials);authenticated=true;listeners.forEach(fn=>fn());return {...result,error:null};}
    catch(error){return {error};}
  },
  async signOut(){await backendRequest('/api/auth/logout',{});authenticated=false;listeners.forEach(fn=>fn());return {error:null};},
  onAuthStateChange(callback:()=>void){listeners.add(callback);return {data:{subscription:{unsubscribe:()=>listeners.delete(callback)}}};},
};

// A small bridge for the CMS's existing row mappers. SQL filtering remains server-owned.
class Query {
  private operation='read'; private rows:any; private filters:Array<[string,unknown]>=[];
  private sorting?:[string,boolean]; private count?:number; private one=false;
  constructor(private table:string){}
  select(_columns='*'){return this;}
  eq(key:string,value:unknown){this.filters.push([key,value]);return this;}
  order(key:string,options:{ascending:boolean}){this.sorting=[key,options.ascending];return this;}
  limit(count:number){this.count=count;return this;}
  maybeSingle(){this.one=true;return this;}
  upsert(rows:any){this.operation='upsert';this.rows=rows;return this;}
  insert(rows:any){this.operation='insert';this.rows=rows;return this;}
  delete(){this.operation='delete';return this;}
  private async execute(){
    try{
      const table=encodeURIComponent(this.table);
      let result;
      if(this.operation==='read'&&typeof window==='undefined'&&prerenderRows){
        if(!Object.prototype.hasOwnProperty.call(prerenderRows,this.table))throw new Error('Private table excluded from public build.');
        result={data:structuredClone(prerenderRows[this.table])};
      }
      else if(this.operation==='read')result=await backendRequest(`/api/${authenticated?'admin':'content'}/${table}`);
      else{
        if(this.operation==='delete'&&(this.filters.length!==1||this.filters[0][0]!=='id'))throw new Error('Deletion requires a record ID.');
        result=await backendRequest(`/api/admin/${table}`,{operation:this.operation,rows:Array.isArray(this.rows)?this.rows:[this.rows],id:this.filters[0]?.[1]});
      }
      let data=result.data;
      for(const [key,value] of this.filters)data=data.filter((r:any)=>r[key]===value);
      if(this.sorting){const [key,ascending]=this.sorting;data.sort((a:any,b:any)=>(a[key]===b[key]?0:a[key]>b[key]?1:-1)*(ascending?1:-1));}
      if(this.count!==undefined)data=data.slice(0,this.count);
      return {data:this.one?data[0]||null:data,error:null};
    }catch(error){return {data:null,error};}
  }
  then<T = {data:any;error:any}, E = never>(resolve?: ((value:{data:any;error:any})=>T|PromiseLike<T>)|null, reject?: ((reason:any)=>E|PromiseLike<E>)|null):Promise<T|E> {return this.execute().then(resolve,reject);}
}
export const mysqlClient={from:(table:string)=>new Query(table)};
