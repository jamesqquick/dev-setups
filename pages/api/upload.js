const { table, getUser, createUser } = require('../../utils/airtable');
const { cloudinary } = require('../../utils/cloudinary');
const auth0 = require('../../utils/auth0');

export default auth0.default.requireAuthentication(async (req, res) => {
    const { user } = await auth0.default.getSession(req);
    const username = user['http://devsetups.com/handle'];
    const file = req.body;
    try {
        const existingRecord = await getUser(username);
        console.log(existingRecord);
        if (existingRecord && existingRecord.imgId) {
            //delete previous image from Cloudinary if one already exists
            await cloudinary.api.delete_resources([existingRecord.imgId]);
        }
        const { public_id } = await cloudinary.uploader.upload(file, {
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
            transformation: [{ flags: "force_strip" }],
        });

        if (existingRecord) {
            //update the user
            const recordUpdate = {
                id: existingRecord.id,
                fields: { imgId: public_id, approved: false },
            };
            await table.update([recordUpdate]);
            return res.json(existingRecord);
        } else {
            //create the user
            const user = {
                fields: {
                    username,
                    imgId: public_id,
                    approved: false,
                },
            };
            const createdRecord = await createUser(user);
            return res.json(createdRecord);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ err: 'Failed to update user' });
    }
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb',
        },
    },
};
