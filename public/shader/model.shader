Shader "FateShader3Compatible" {

	Properties{
		_Alpha("Alpha", 2D) = "white" {}
		_Color ("Main Color", Color) = (1,1,1,1)
		_AddColor ("Add Color", Color) = (0,0,0,0)
		_MainTex ("Base (RGBA)", 2D) = "white" { }
		_Cutoff ("Base Alpha cutoff", Range(0, 1)) = 0.9
	}

	SubShader{
		Tags { "IGNOREPROJECTOR" = "true" "QUEUE" = "Transparent" "RenderType" = "TransparentCutout" }

		Pass //Opaque Character
		{
			Tags { "IGNOREPROJECTOR" = "true" "QUEUE" = "Transparent" "RenderType" = "TransparentCutout" }
			Cull Off

			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#include "UnityCG.cginc"

			struct appdata
			{
				float4 vertex : POSITION0;
				float2 uv : TEXCOORD0;
				float4 color : COLOR0;
			};

			struct v2f
			{
				float2 uv : TEXCOORD0;
				float4 vertex : POSITION0;
				float4 color : COLOR0;
			};
				
			sampler2D _MainTex;
			sampler2D _Alpha;
			fixed4 _Color;
			fixed4 _AddColor;
			float4 u_xlat0;
			float4 u_xlat1;

			v2f vert(appdata v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				o.uv = v.uv;
				return o;
			}

			fixed4 frag(v2f i) : SV_Target
			{
				fixed4 col = tex2D(_MainTex, i.uv);
				fixed4 alph = tex2D(_Alpha, i.uv);
				col.a *= alph.r;
				col = _Color * col + _AddColor;
				clip(col.a - 0.99);
				return col;
			}
			ENDCG
		}
		//Pass  //Line 428 Cutoff Transparency (0.5)
		//{
		//	Tags { "IGNOREPROJECTOR" = "true" "RenderType" = "TransparentCutout" }
		//	Cull Off
		//	ColorMask 0
		//	CGPROGRAM
		//	#pragma vertex vert
		//	#pragma fragment frag
		//	#include "UnityCG.cginc"
		
		//	struct appdata
		//	{
		//		float4 vertex : POSITION0;
		//		float2 uv : TEXCOORD0;
		//		float4 color : COLOR0;
		//	};

		//	struct v2f
		//	{
		//		float2 uv : TEXCOORD0;
		//		float4 vertex : POSITION0;
		//		float4 color : COLOR0;
		//	};
				
		//	sampler2D _MainTex;
		//	sampler2D _Alpha;
		//	fixed4 _Color;
		//	fixed4 _AddColor;
		//	float _Cutoff;
		//	float4 u_xlat0;
		//	float4 u_xlat1;

		//	v2f vert(appdata v)
		//	{
		//		v2f o;
		//		o.color = fixed4(0,0,0,1);
		//		o.uv = v.uv;
		//		u_xlat0 = mul(unity_ObjectToWorld, v.vertex.xyz);
		//		o.vertex = UnityObjectToClipPos(u_xlat0);
		//		return o;
		//	}
			
		//	fixed4 frag(v2f i) : SV_Target
		//	{
		//		fixed4 col = tex2D(_MainTex, i.uv);
		//		col = _Color * col + _AddColor;
		//		clip(col.a - _Cutoff);
		//		return col;
		//	}
		//	ENDCG
		//}
		Pass //ADD COLORS
		{
			Cull Off // make double sided
			Blend SrcAlpha OneMinusSrcAlpha

			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag

			#include "UnityCG.cginc"

			struct appdata
			{
				float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
			};

			struct v2f
			{
				float2 uv : TEXCOORD0;
				float4 vertex : SV_POSITION;
			};

			sampler2D _MainTex;
			sampler2D _Alpha;
			fixed4 _ColorTint;
			float _Cutoff;
			float4 u_xlat0;

			v2f vert(appdata v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.uv = v.uv; // just pass through with no scale/offset
				return o;
			}

			fixed4 frag(v2f i) : SV_Target
			{
				fixed4 col = tex2D(_MainTex, i.uv);
				fixed4 alph = tex2D(_Alpha, i.uv);
				col.a *= alph.r;
				clip(col.a - (1-_Cutoff));
				return col;
			}
			ENDCG
		}
	}
}