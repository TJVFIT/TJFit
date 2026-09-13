"use client";
import {TjaiLoggingPanel} from './tjai-logging-panel';
import type {Locale} from '@/lib/i18n';
export function TJAIProgressTab({locale='en'}:{locale?:string}){return <TjaiLoggingPanel locale={(['en','tr','ar','es','fr'].includes(locale)?locale:'en') as Locale}/>;}
