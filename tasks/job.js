module.exports= class Job{
    id
    source
    lang
    scenario
    timelimit
    constructor({id,source,lang,timelimit=5,scenario}){
        this.id=id
        this.source=source
        this.lang=lang
        this.timelimit=timelimit
        this.scenario=scenario
    }
}