import { NextRequest, NextResponse } from "next/server";
import signupSchema from "../../../../../schema/sign-up-schema";
import db from "../../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const schema = await signupSchema.validate(body);

    const { error } = await db
      .from("public_wallet_key")
      .insert({ contract: schema.contract, public_key: schema.publicKey });

    if(error){
        return NextResponse.json({ message: 'An unexcepted error occured please try again.' }, { status: 500 }); 
    }
    
    return NextResponse.json({ contract: schema.contract, publicKey: schema.publicKey }, { status: 200 });
  } catch (e) {
    const error = e as unknown as SchemaProps;
    return NextResponse.json({ body: error.message }, { status: 422 });
  }
}
