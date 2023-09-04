export default abstract class BaseService<TReq=any,TRes=any>{
  abstract create(data:TReq):Promise<TRes>
  abstract fetchAll():Promise<TRes[]>
  abstract fetchById(id:string):Promise<TRes>
  abstract deleteById(id:string):Promise<TRes>
  abstract update(data:TReq):Promise<TRes>
}