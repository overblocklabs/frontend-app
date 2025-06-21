import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ contract: string }> }) {
  const contract = (await params).contract;

  const { data, error } = await db
  .from('public_wallet_key')
  .select('public_key')
  .eq('public_key', contract)
  
  if(error){
    return NextResponse.json({message: 'An unexcepted error occured please try again'}, {status: 500})

  }

  if(!data.length){
    return NextResponse.json({message: 'This public key did not found'}, {status: 404})
  }

  return NextResponse.json({publicKey: data[0].public_key}, {status: 200})
}
 

