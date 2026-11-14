export type Role = {id:string;title:string;category:string;description:string;skills:string[]}
export type MatchedSkill = {skill:string;weight:number;evidence:string}
export type MissingSkill = {skill:string;weight:number}
export type RoadmapItem = {skill:string;priority:number;effort:string;resource_title:string;resource_url:string}
export type Analysis = {role_id:string;role:string;score:number;score_type:string;matched:MatchedSkill[];missing:MissingSkill[];detected_skills:string[];roadmap:RoadmapItem[];methodology:string;disclaimer:string}
export type Point = {month:string;count:number}
export type Market = {role_id:string;role:string;data_status:'synthetic_demo'|'validated';can_make_real_world_claims:boolean;source_label:string;method:string;history:Point[];forecast:Point[];latest_sample_count:number;sample_growth_pct:number;sample_projection:number;disclaimer:string}
export type SavedAnalysis = {id:string;user_id:string;target_role:string;detected_skills:string[];missing_skills:string[];readiness_score:number;recommendations:RoadmapItem[];created_at:string}
