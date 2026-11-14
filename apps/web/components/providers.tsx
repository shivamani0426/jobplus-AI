'use client'
import {createContext,useContext,useEffect,useMemo,useState} from 'react'
import type {User} from '@supabase/supabase-js'
import {browserSupabase} from '@/lib/supabase'
import {roleById} from '@/lib/catalog'
const Context=createContext<{role:string;setRole:(role:string)=>void;user:User|null;authLoading:boolean}>({role:'data-scientist',setRole:()=>{},user:null,authLoading:true})
export function Providers({children}:{children:React.ReactNode}){
 const [role,setRoleState]=useState('data-scientist')
 const [user,setUser]=useState<User|null>(null)
 const [authLoading,setAuthLoading]=useState(true)
 useEffect(()=>{const value=window.localStorage.getItem('jobpulse:role');if(value)setRoleState(roleById(value).id)},[])
 const setRole=(next:string)=>{const id=roleById(next).id;setRoleState(id);localStorage.setItem('jobpulse:role',id)}
 useEffect(()=>{const sb=browserSupabase();if(!sb){setAuthLoading(false);return}
   let alive=true;sb.auth.getUser().then(({data})=>{if(alive){setUser(data.user);setAuthLoading(false)}}).catch(()=>{if(alive)setAuthLoading(false)})
   const {data:{subscription}}=sb.auth.onAuthStateChange((_e,s)=>{setUser(s?.user??null);setAuthLoading(false)})
   return()=>{alive=false;subscription.unsubscribe()}
 },[])
 const value=useMemo(()=>({role,setRole,user,authLoading}),[role,user,authLoading])
 return <Context.Provider value={value}>{children}</Context.Provider>
}
export const useJobPulse=()=>useContext(Context)
