import { NextRequest, NextResponse } from "next/server";
import signupSchema from "../../../../../schema/sign-up-schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const schema = await signupSchema.validate(body);
    return NextResponse.json({ body: schema.publicKey }, { status: 200 });
  } catch (e) {
    const error = e as unknown as SchemaProps;
    return NextResponse.json({ body: error.message }, { status: 422 });
  }
}
