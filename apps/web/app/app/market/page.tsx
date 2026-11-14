import type {Metadata} from 'next'
import {MarketModule} from '@/components/market-module'
export const metadata:Metadata={title:'Market intelligence'}
export default function Page(){return <MarketModule/>}
