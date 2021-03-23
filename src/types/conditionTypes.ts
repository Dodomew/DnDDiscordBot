export interface ApiConditionResponse {
    results: ConditionProps[]
}

export interface ConditionProps {
    slug: string,
    name: string,
    desc: string
}