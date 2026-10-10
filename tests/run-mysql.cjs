// Disposable local MySQL only. Does not load .env or accept production DB credentials.
const {spawnSync}=require('node:child_process');
const {randomBytes}=require('node:crypto');
const path=require('node:path');
const fs=require('node:fs');
const mysql=require('mysql2/promise');
const desktop=path.join(process.env.LOCALAPPDATA||'','Programs/DockerDesktop/resources/bin/docker.exe');
const docker=process.env.DOCKER_BIN||(fs.existsSync(desktop)?desktop:'docker');
const name='lalusis-test-'+randomBytes(5).toString('hex'),password=randomBytes(24).toString('hex');
let owned=false;
(async()=>{
  try{
    const started=spawnSync(docker,['run','-d','--name',name,'-p','127.0.0.1::3306','-e','MYSQL_ROOT_PASSWORD='+password,'mysql:8.4'],{encoding:'utf8'});
    if(started.status!==0)throw new Error(started.stderr||'Docker could not start MySQL.');owned=true;
    const mapping=spawnSync(docker,['port',name,'3306/tcp'],{encoding:'utf8'}).stdout.trim();
    if(!/^127\.0\.0\.1:\d+$/.test(mapping))throw new Error('Unexpected test port mapping.');
    const port=Number(mapping.split(':')[1]);let connection;
    for(let i=0;i<60;i++){try{connection=await mysql.createConnection({host:'127.0.0.1',port,user:'root',password});break;}catch{await new Promise(r=>setTimeout(r,1000));}}
    if(!connection)throw new Error('MySQL startup timed out.');
    await connection.query('CREATE DATABASE lalusis_backend_test');await connection.query('CREATE DATABASE lalusis_migration_test');await connection.end();
    for(const [database,file] of [['lalusis_backend_test','mysql-backend.test.ts'],['lalusis_migration_test','mysql-migration.test.ts']]){
      const result=spawnSync(process.execPath,['node_modules/tsx/dist/cli.mjs','--test','tests/'+file],{encoding:'utf8',env:{...process.env,DB_HOST:'127.0.0.1',DB_PORT:String(port),DB_USER:'root',DB_PASSWORD:password,DB_NAME:database,DB_SSL_CA_FILE:''}});
      process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
      if(result.status!==0)throw new Error(file+' failed.');
    }
  }finally{if(owned)spawnSync(docker,['rm','-f','-v',name],{stdio:'ignore'});}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
